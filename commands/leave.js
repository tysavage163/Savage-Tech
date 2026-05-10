module.exports = {
    category: 'owner',
    name: 'leave',
    description: 'Bot leaves a group (owner only)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        if (!isArchitect) {
            return sock.sendMessage(from, { text: '❌ You are not the bot owner.' });
        }
        if (isGroup && (!args[0] || args[0].toLowerCase() === 'this')) {
            await sock.groupLeave(from);
            return sock.sendMessage(from, { text: '👋 Left this group.' });
        }
        const jid = args[0]?.includes('@') ? args[0] : args[0] + '@g.us';
        if (!jid.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ Provide a valid group JID or use ".leave this"' });
        }
        try {
            await sock.groupLeave(jid);
            await sock.sendMessage(from, { text: `✅ Left group: ${jid}` });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` });
        }
    }
};
