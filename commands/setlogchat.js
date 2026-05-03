module.exports = {
    name: 'setlogchat',
    category: 'owner',
    description: 'Set this chat as the anti‑delete log (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });
        global.antideleteLogChat = from;
        await sock.sendMessage(from, { text: `✅ Anti‑delete logs will be sent here (this chat).` });
    }
};
