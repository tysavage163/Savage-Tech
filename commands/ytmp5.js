const axios = require('axios');
const yts = require('yt-search');

module.exports = {
    name: 'ytmp5',
    category: 'download',
    description: 'Get both MP3 and MP4 download URLs',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .ytmp5 <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching...' }, { quoted: msg });

        try {
            let videoUrl = query;
            if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) {
                    return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
                }
                videoUrl = searchResults.videos[0].url;
            }

            const endpoints = [
                `https://apis.xwolf.space/download/ytmp5?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/mp4?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/video?url=${encodeURIComponent(videoUrl)}`
            ];

            let mp3Url = null;
            let mp4Url = null;
            let success = false;

            for (const endpoint of endpoints) {
                try {
                    const response = await axios({
                        method: 'get',
                        url: endpoint,
                        timeout: 60000,
                        headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
                    });

                    if (endpoint.includes('ytmp5')) {
                        mp3Url = response.data.mp3 || response.data.audioUrl;
                        mp4Url = response.data.mp4 || response.data.videoUrl;
                    } else {
                        // For /mp4 or /video endpoints
                        const url = response.data.downloadUrl || response.data.url;
                        if (url) mp4Url = url;
                    }

                    if (mp3Url || mp4Url) {
                        success = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!success || (!mp3Url && !mp4Url)) {
                return sock.sendMessage(from, { text: '❌ No download URLs found. Try another song or use .play' }, { quoted: msg });
            }

            let caption = `🎵 *YTMP5 - LINKS*\n\n`;
            if (mp3Url) caption += `🎵 *MP3:*\n${mp3Url}\n\n`;
            if (mp4Url) caption += `🎥 *MP4:*\n${mp4Url}\n\n`;
            caption += `_⚡ Powered by Savage-Tech_`;

            await sock.sendMessage(from, { text: caption }, { quoted: msg });
        } catch (error) {
            console.error('YTMP5 error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to fetch links. Try another song or URL.' }, { quoted: msg });
        }
    }
};
