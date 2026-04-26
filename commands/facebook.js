const axios = require("axios");

module.exports = {
    category: 'tools',
    name: "facebook",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];

        if (!url) return sock.sendMessage(from, { text: "🔗 *SYSTEM:* Provide a Facebook URL. (.facebook [link])" });

        await sock.sendMessage(from, { text: "⏳ *SAVAGE-V3:* Extracting media from Meta servers..." });

        try {
            // Using a high-speed stable API
            const res = await axios.get(`https://api.botcahx.eu.org/api/dowloader/fbdown?url=${encodeURIComponent(url)}&apikey=beta`);
            
            // Check if results exist
            if (res.data && res.data.result) {
                const videoData = res.data.result.url.find(v => v.sd) || res.data.result.url[0];
                const videoUrl = videoData.url || videoData;

                await sock.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: "⚡ *EVOLUTION COMPLETE*\n_Downloaded via Savage-Tech_",
                    mimetype: 'video/mp4'
                }, { quoted: msg });
            } else {
                throw new Error("Invalid API Response");
            }
        } catch (e) {
            console.log("FB Error:", e);
            await sock.sendMessage(from, { text: "💀 *FAILURE:* Link is private, expired, or invalid." });
        }
    }
};
