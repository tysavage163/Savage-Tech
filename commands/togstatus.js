module.exports = {
    name: 'togstatus',
    category: 'group',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        console.log(`Sender JID: ${sender}`);

        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            console.log(`Group participants: ${meta.participants.map(p => p.id).join(', ')}`);
            const participant = meta.participants.find(p => {
                // Normalise both JIDs: remove any :0 suffix and compare the base part
                const pId = p.id.split(':')[0];
                const sId = sender.split(':')[0];
                return pId === sId;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            console.log(`Is admin? ${isAdmin}`);
        } catch (err) {
            console.error('Admin check error:', err);
        }
        if (!isAdmin) return sock.sendMessage(from, { text: 'Only group admins can use this command.' });

        const statusText = args.join(' ');
        if (!statusText) return sock.sendMessage(from, { text: 'Usage: .togstatus <text>' });

        try {
            await sock.sendMessage(from, { groupStatusMessage: { text: statusText } });
            await sock.sendMessage(from, { text: '✅ Group story posted (24h).' });
        } catch (err) {
            console.error('Story error:', err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` });
        }
    }
};
