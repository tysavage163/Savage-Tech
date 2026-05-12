module.exports = {
    name: 'togstatus',
    category: 'group',
    description: 'Post a status story to the group (24h expiry). Admins only.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        const senderNumber = sender.split('@')[0].split(':')[0];

        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const participant = meta.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === senderNumber;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            console.log(`togstatus: sender=${senderNumber}, isAdmin=${isAdmin}`);
        } catch (err) {
            console.error('Admin check error:', err);
        }

        if (!isAdmin) return sock.sendMessage(from, { text: 'Only group admins can use this command.' });

        const statusText = args.join(' ');
        if (!statusText) return sock.sendMessage(from, { text: 'Usage: .togstatus <text>' });

        try {
            await sock.sendMessage(from, { groupStatusMessage: { text: statusText } });
            await sock.sendMessage(from, { text: '✅ Group status story posted! It will disappear in 24 hours.' });
        } catch (err) {
            console.error('Story error:', err);
            await sock.sendMessage(from, { text: `Failed: ${err.message}` });
        }
    }
};
