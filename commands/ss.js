module.exports = {
    name: 'ss',
    category: 'tools',
    async execute(sock, msg, args, { hasAccess }) {
        if (!hasAccess) return;
        const url = args[0];
        if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '📎 Provide a URL.' });
        await sock.sendMessage(msg.key.remoteJid, { text: '📸 *SΛVΛGΞ:* Capturing...' });
    }
};
