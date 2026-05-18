const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'play',
    category: 'download',
    description: 'Download audio from YouTube (song name or URL)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .play <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for audio...' }, { quoted: msg });

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
            const thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            let fileSizeMB = null;

            const apiUrl = `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`;
            const headResponse = await axios.head(apiUrl).catch(() => null);
            if (headResponse && headResponse.headers['content-length']) {
                fileSizeMB = (parseInt(headResponse.headers['content-length']) / (1024 * 1024)).toFixed(2);
            }

            if (fileSizeMB && parseFloat(fileSizeMB) > 16) {
                return sock.sendMessage(from, { text: `❌ Audio too large (${fileSizeMB} MB). Max 16 MB allowed.` }, { quoted: msg });
            }

            const caption = `🎵 *AUDIO DOWNLOADER*
- *Title:* ${title}
- *Duration:* ${duration}
- *Views:* ${views}
- *Author:* ${author}
- *Size:* ${fileSizeMB ? `${fileSizeMB} MB` : 'Unknown'}
- *Status:* Downloading...
- *Powered by Savage-Tech*`;

            await sock.sendMessage(from, { 
                image: { url: thumbnail },
                caption: caption
            }, { quoted: msg });

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
                const stats = fs.statSync(tempFile);
                const actualSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                if (stats.size > 16 * 1024 * 1024) {
                    fs.unlinkSync(tempFile);
                    return sock.sendMessage(from, { text: `❌ Audio too large (${actualSizeMB} MB). Max 16 MB.` }, { quoted: msg });
                }
                await sock.sendMessage(from, {
                    audio: { url: tempFile },
                    mimetype: 'audio/mpeg',
                    fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                    ptt: false
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
