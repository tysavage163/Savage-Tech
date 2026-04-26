module.exports = {
    name: "shorten",
    category: "other",
    description: "Shorten a long URL",
    async execute(sock, msg, args) {
        const url = args[0];
        if (!url) return sock.sendMessage(msg.key.remoteJid, { text: "🌐 *SΛVΛGΞ:* Provide a link to compress." });

        try {
            const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = await res.text();
            await sock.sendMessage(msg.key.remoteJid, { text: `🔗 **COMPRESSED LINK:** ${shortUrl}` }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *ERROR:* Compression failed." });
        }
    }
};
