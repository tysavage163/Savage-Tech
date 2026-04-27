const axios = require('axios');

module.exports = {
    name: "setgcicon",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const url = args[0];
        if (!url) return sock.sendMessage(from, { text: "🖼️ *SΛVΛGΞ:* Provide an image link." });

        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            await sock.updateProfilePicture(from, buffer);
            await sock.sendMessage(from, { text: "✅ **SΛVΛGΞ:** Icon updated." });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **FAIL:** Check the link or Admin status." });
        }
    }
};
