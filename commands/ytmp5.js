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

            const endpoint = `https://apis.xwolf.space/download/ytmp5?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios({
                method: 'get',
                url: endpoint,
                timeout: 20000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            const mp3Url = response.data.mp3 || response.data.audioUrl || response.data.downloadUrl_mp3;
            const mp4Url = response.data.mp4 || response.data.videoUrl || response.data.downloadUrl_mp4;

            if (!mp3Url && !mp4Url) {
                return sock.sendMessage(from, { text: '❌ No download URLs found.' }, { quoted: msg });
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
