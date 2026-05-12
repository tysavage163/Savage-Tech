module.exports = {
    name: 'togstatus',
    category: 'group',
    description: 'Post a status story to the group (24h expiry). Admins only.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        // Extract numeric part (remove @s.whatsapp.net or @lid and any :0 suffix)
        const senderNumber = sender.split('@')[0].split(':')[0];

        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const participant = meta.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === senderNumber;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            console.log(`togstatus: senderNumber=${senderNumber}, isAdmin=${isAdmin}`);
        } catch (err) {
            console.error('Admin check error:', err);
        }

        if (!isAdmin) return sock.sendMessage(from, { text: 'Only group admins can use this command.' });

        const statusText = args.join(' ');
        if (!statusText) {
            return sock.sendMessage(from, { text: '❓ Usage: .togstatus <your story text>' });
        }

        try {
            // Post the group story (disappears after 24h)
            await sock.sendMessage(from, { groupStatusMessage: { text: statusText } });
            await sock.sendMessage(from, { text: '✅ Group status story posted! It will disappear in 24 hours.' });
        } catch (err) {
            console.error('Story error:', err);
            await sock.sendMessage(from, { text: `❌ Failed to post story: ${err.message}` });
        }
    }
};
