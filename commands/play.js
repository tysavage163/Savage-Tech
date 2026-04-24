const yts = require('yt-search');
const axios = require('axios');

module.exports = {
    name: 'play',
    category: 'media',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return sock.sendMessage(from, { text: '𝄞 *SΛVΛGΞ*: What are we playing?' });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: '❌ Video not found.' });

            // 1. Fully Surrounded Musical Table
            const infoText = `
𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡
𝄞 ━━━ 「 *SAVAGE-PLAY* 」 ━━━ 𝄡
𝄞                                   𝄡
𝄞 🎵 *Title:* ${video.title} 𝄢
𝄞 ⏳ *Duration:* ${video.timestamp} 𝄢
𝄞 🔗 *Link:* ${video.url} 𝄢
𝄞                                   𝄡
𝄞 ━━━━━━━━━━━━━━━━━━━━ 𝄡
𝄞  _🚀 Ultra-Optimization Active..._  𝄡
𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡`;

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: msg });

            // 2. High-Speed API Fetch
            const apiUrl = `https://api.vreden.my.id/api/ytmp3?url=${video.url}`;
            const response = await axios.get(apiUrl);

            if (response.data.status !== 200 || !response.data.result.download) {
                throw new Error("API Limit");
            }

            const audioUrl = response.data.result.download;

            // 3. Direct Delivery
            await sock.sendMessage(from, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });

        } catch (e) {
            console.error('Savage-Play Error:', e);
            sock.sendMessage(from, { text: '𝄢 Playback Error: Stream Interrupted. Falling back...' });
            
            try {
                const fallbackUrl = `https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(video.url)}`;
                const res = await axios.get(fallbackUrl);
                await sock.sendMessage(from, { 
                    audio: { url: res.data.data.url }, 
                    mimetype: 'audio/mp4' 
                }, { quoted: msg });
            } catch (err) {
                sock.sendMessage(from, { text: '💀 System Error: Could not retrieve audio.' });
            }
        }
    }
};
