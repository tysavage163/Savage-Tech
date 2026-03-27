const axios = require('axios');

module.exports = {
    name: 'dl',
    description: 'Download videos from YouTube/TikTok/IG',
    async execute(sock, m, args) {
        const url = args[0];
        if (!url) return sock.sendMessage(m.key.remoteJid, { text: '❌ Please provide a link! Example: !dl https://tiktok.com/...' });

        await sock.sendMessage(m.key.remoteJid, { text: '📥 *Savage-Tech is fetching your media...*' }, { quoted: m });

        try {
            // Using a common public API for downloading (Replace with your preferred API if needed)
            const response = await axios.get(`https://api.lolhuman.xyz/api/download/universal?apikey=FREE&url=${url}`);
            const data = response.data.result;

            await sock.sendMessage(m.key.remoteJid, { 
                video: { url: data.link || data.url }, 
                caption: `✅ *Downloaded by Savage-Tech*\n👤 *Dev:* Beck Spencer` 
            }, { quoted: m });

        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Error: Could not download. The link might be private or unsupported.' });
        }
    }
};
