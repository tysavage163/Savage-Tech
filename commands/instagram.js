const axios = require('axios');

module.exports = {
    name: 'instagram',
    category: 'download',
    description: 'Download Instagram video/image',
    async execute(sock, msg, args) {
        const url = args[0];
        if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❌ *Provide an Instagram URL!*' });

        const apiUrl = `https://apis.xwolf.space/api/download/instagram?url=${encodeURIComponent(url)}`;

        try {
            const response = await axios.get(apiUrl);
            const data = response.data;

            // Check for success and get the media URL from the right field
            if (data.success && (data.video || data.image)) {
                const mediaUrl = data.video || data.image;
                // Send as video (or image) based on what's available
                await sock.sendMessage(msg.key.remoteJid, { video: { url: mediaUrl }, caption: "✅ *Instagram Download Success!*" });
            } else {
                console.log("API Response:", data);
                await sock.sendMessage(msg.key.remoteJid, { text: `❌ *Download Failed!*\nError: ${data.error || "Invalid response from API"}` });
            }

        } catch (error) {
            console.error(error);
            await sock.sendMessage(msg.key.remoteJid, { text: "❌ *Network Error!* Could not contact the API." });
        }
    }
}
