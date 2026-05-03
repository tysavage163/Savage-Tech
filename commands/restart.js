module.exports = {
    name: 'restart',
    category: 'owner',
    description: 'Restart the bot (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });
        await sock.sendMessage(from, { text: '🔄 Bot restarting...' });
        process.exit(0);
    }
};
