const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'play',
    category: 'download',
    description: 'Download and play audio from YouTube (song name or URL)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .play <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '⏳ Searching for audio...' }, { quoted: msg });

        try {
            let videoUrl = query;
            if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) {
                    return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
                }
                videoUrl = searchResults.videos[0].url;
            }

            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (!videoId) {
                return sock.sendMessage(from, { text: '❌ Invalid YouTube URL.' }, { quoted: msg });
            }

            const info = await yts({ videoId });
            const title = info.title || 'Unknown Title';
            const duration = info.duration.timestamp || 'Unknown';
            const views = info.views?.toLocaleString() || 'Unknown';
            const author = info.author?.name || 'Unknown';

            const caption = `*AUDIO DOWNLOADER 🎵*
- *Title:* ${title}
- *Duration:* ${duration}
- *Views:* ${views}
- *Author:* ${author}
- *Status:* Downloading...
- *Powered by Savage-Tech*`;

            await sock.sendMessage(from, { text: caption }, { quoted: msg });

            const apiUrl = `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios({
                method: 'get',
                url: apiUrl,
                responseType: 'stream',
                headers: { 'User-Agent': 'Savage-Tech-Bot' }
            });

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp3`);

            const writer = fs.createWriteStream(tempFile);
            response.data.pipe(writer);

            writer.on('finish', async () => {
                await sock.sendMessage(from, {
                    audio: { url: tempFile },
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: msg });
                fs.unlinkSync(tempFile);
            });

            writer.on('error', async (err) => {
                console.error('Write error:', err);
                await sock.sendMessage(from, { text: '❌ Failed to save audio.' }, { quoted: msg });
            });
        } catch (error) {
            console.error('Play error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to process request. Try again later.' }, { quoted: msg });
        }
    }
};
