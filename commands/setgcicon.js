const axios = require('axios');

module.exports = {
    name: "setgcicon",
    category: "group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        const url = args[0];
        if (!url) return sock.sendMessage(from, { text: "🖼️ *SΛVΛGΞ:* Provide a valid image link." });

        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data, 'binary');
            
            await sock.updateProfilePicture(from, buffer);
            await sock.sendMessage(from, { text: "✅ **SΛVΛGΞ:** Group DNA updated (Icon changed)." });
        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ **FAIL:** Connection to image refused. Try a different link." });
        }
    }
};
