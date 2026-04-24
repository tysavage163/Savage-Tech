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

            // 1. Fully Surrounded Musical Table (No Rocket)
            const infoText = `
𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡
𝄞 ━━━ 「 *SAVAGE-PLAY* 」 ━━━ 𝄡
𝄞                                   𝄡
𝄞 🎵 *Title:* ${video.title} 𝄢
𝄞 ⏳ *Duration:* ${video.timestamp} 𝄢
𝄞 🔗 *Link:* ${video.url} 𝄢
𝄞                                   𝄡
𝄞 ━━━━━━━━━━━━━━━━━━━━ 𝄡
𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡`;

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: msg });

            // 2. High-Stability API Fetch
            const apiUrl = `https://api.lolhuman.xyz/api/yt2mp3?apikey=GataDios&url=${video.url}`;
            const response = await axios.get(apiUrl);

            if (!response.data || !response.data.result) {
                throw new Error("Main API Fail");
            }

            const audioUrl = response.data.result;

            // 3. Direct Buffer Delivery
            await sock.sendMessage(from, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });

        } catch (e) {
            console.error('Savage-Play Error:', e);
            sock.sendMessage(from, { text: '𝄢 Local stream failed. Attempting global bypass...' });
            
            try {
                // Secondary High-Stability Fallback
                const res = await axios.get(`https://pod02.9xbuddy.xyz/api/convert?url=${encodeURIComponent(args.join(' '))}`);
                await sock.sendMessage(from, { 
                    audio: { url: res.data.results[0].url }, 
                    mimetype: 'audio/mp4' 
                }, { quoted: msg });
            } catch (err) {
                sock.sendMessage(from, { text: '💀 *SYSTEM ERROR:* YouTube is blocking our signature. Try again in 5 minutes.' });
            }
        }
    }
};
