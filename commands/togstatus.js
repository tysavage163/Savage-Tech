module.exports = {
    name: 'togstatus',
    category: 'group',
    description: 'Post a status story to the group (24h expiry). Admins only.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = await global.checkAdmin?.(sock, from, sender);
        if (!isAdmin) return sock.sendMessage(from, { text: 'Only group admins can use this command.' });

        const statusText = args.join(' ');
        if (!statusText) {
            return sock.sendMessage(from, { text: '❓ Usage: .togstatus <your story text>' });
        }

        try {
            // Post group status story (disappears after 24h)
            await sock.sendMessage(from, { groupStatusMessage: { text: statusText } });
            await sock.sendMessage(from, { text: '✅ Group status story posted! It will disappear in 24 hours.' });
        } catch (err) {
            console.error('Story error:', err);
            await sock.sendMessage(from, { text: `❌ Failed to post story: ${err.message}` });
        }
    }
};
