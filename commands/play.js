const yts = require('yt-search');
const axios = require('axios');

module.exports = {
    category: 'tools',
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
    𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡 𝄞 𝄢 𝄡`;

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: msg });

            // 2. Fetch using a Public High-Stability API
            // This endpoint currently bypasses the need for a private key
            const res = await axios.get(`https://api.vreden.my.id/api/ytmp3?url=${video.url}`);
            
            if (!res.data || !res.data.result || !res.data.result.download) {
                throw new Error("API Route Blocked");
            }

            const audioUrl = res.data.result.download;

            // 3. Direct Delivery
            await sock.sendMessage(from, { 
                audio: { url: audioUrl }, 
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });

        } catch (e) {
            console.error('Savage-Play Error:', e);
            
            // Fallback for when the first API is down
            try {
                const fallback = await axios.get(`https://api.agatz.xyz/api/ytmp3?url=${encodeURIComponent(query)}`);
                await sock.sendMessage(from, { 
                    audio: { url: fallback.data.data.url }, 
                    mimetype: 'audio/mp4' 
                }, { quoted: msg });
            } catch (err) {
                sock.sendMessage(from, { text: '💀 *SYSTEM ERROR:* All music nodes are currently congested. Try again in a minute.' });
            }
        }
    }
};
