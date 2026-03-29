const axios = require('axios');

module.exports = {
    name: 'tt',
    async execute(sock, m, args) {
        const url = args[0];
        if (!url) return sock.sendMessage(m.key.remoteJid, { text: '❌ Paste a TikTok link!' });

        try {
            const res = await axios.get(`https://api.lolhuman.xyz/api/tiktok?apikey=free&url=${url}`);
            const videoUrl = res.data.result.link;

            await sock.sendMessage(m.key.remoteJid, { 
                video: { url: videoUrl }, 
                caption: `✅ *TikTok Downloaded!*` 
            }, { quoted: m });
        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Error fetching TikTok. Check the link.' });
        }
    }
};
