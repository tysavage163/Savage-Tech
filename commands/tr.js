module.exports = {
    name: 'tr',
    category: 'tools',
    async execute(sock, msg, args, { hasAccess }) {
        if (!hasAccess) return;
        const text = args.join(' ');
        if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '📎 Provide text to translate.' });
        await sock.sendMessage(msg.key.remoteJid, { text: '🌐 *SΛVΛGΞ:* Translating...' });
    }
};
