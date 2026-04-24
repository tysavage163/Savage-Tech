const axios = require("axios");

module.exports = {
    name: "fb",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];

        if (!url || !url.includes("facebook.com")) {
            return sock.sendMessage(from, { text: "⚠️ *ERROR:* Please provide a valid Facebook video URL." });
        }

        await sock.sendMessage(from, { text: "⏳ *SAVAGE-TECH:* Fetching Facebook video... please wait." });

        try {
            // Using a public API relay for Facebook downloading
            const response = await axios.get(`https://api.vreden.my.id/api/fbdown?url=${encodeURIComponent(url)}`);
            const data = response.data;

            if (data.status && data.result) {
                // Prioritize HD if available, otherwise SD
                const videoUrl = data.result.hd || data.result.sd;

                await sock.sendMessage(from, { 
                    video: { url: videoUrl }, 
                    caption: "✅ *SUCCESS:* Video Downloaded by Savage-Tech.",
                    mimetype: 'video/mp4'
                }, { quoted: msg });
            } else {
                throw new Error("Invalid response from API");
            }
        } catch (err) {
            console.log("FB Downloader Error:", err);
            await sock.sendMessage(from, { text: "💀 *FAILURE:* Could not process this video. The link might be private or broken." });
        }
    }
};
