const axios = require("axios");

module.exports = {
    name: "fb",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];

        if (!url) return sock.sendMessage(from, { text: "🔗 *SYSTEM:* Provide a Facebook link." });

        await sock.sendMessage(from, { text: "⏳ *SAVAGE-V3:* Extracting media..." });

        try {
            // Using a more stable Global API
            const res = await axios.get(`https://api.botcahx.eu.org/api/dowloader/fbdown?url=${url}&apikey=beta`);
            const video = res.data.result.url.find(v => v.sd) || res.data.result.url[0];

            await sock.sendMessage(from, { 
                video: { url: video.url || video }, 
                caption: "⚡ *EVOLUTION COMPLETE*",
                mimetype: 'video/mp4'
            }, { quoted: msg });
        } catch (e) {
            await sock.sendMessage(from, { text: "💀 *FAILURE:* Link protection active or API down." });
        }
    }
};
