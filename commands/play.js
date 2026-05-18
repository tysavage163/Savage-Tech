const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'play',
    category: 'download',
    description: 'Download audio from YouTube',
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

            // Try multiple endpoints if one fails
            const endpoints = [
                `https://apis.xwolf.space/download/yta2?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/ytmp3?url=${encodeURIComponent(videoUrl)}`
            ];

            let audioStream = null;
            let usedEndpoint = null;

            for (const endpoint of endpoints) {
                try {
                    const testRes = await axios({
                        method: 'get',
                        url: endpoint,
                        responseType: 'stream',
                        timeout: 15000,
                        headers: { 'User-Agent': 'Savage-Tech-Bot' }
                    });
                    if (testRes.headers['content-type']?.includes('audio') || testRes.headers['content-length'] > 1000) {
                        audioStream = testRes;
                        usedEndpoint = endpoint;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!audioStream) {
                return sock.sendMessage(from, { text: '❌ No working audio source found. Try another song.' }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp3`);

            const writer = fs.createWriteStream(tempFile);
            audioStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = fs.statSync(tempFile);
            const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);

            if (stats.size === 0) {
                fs.unlinkSync(tempFile);
                return sock.sendMessage(from, { text: '❌ Downloaded file is empty.' }, { quoted: msg });
            }

            if (stats.size > 16 * 1024 * 1024) {
                fs.unlinkSync(tempFile);
                return sock.sendMessage(from, { text: `❌ Audio too large (${fileSizeMB} MB). Max 16 MB.` }, { quoted: msg });
            }

            const caption = `🎵 *AUDIO DOWNLOADER*
- *Title:* ${title}
- *Duration:* ${duration}
- *Views:* ${views}
- *Author:* ${author}
- *Size:* ${fileSizeMB} MB
- *Status:* ✅ Ready
- *Powered by Savage-Tech*`;

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: caption
            }, { quoted: msg });

            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                ptt: false
            }, { quoted: msg });

            fs.unlinkSync(tempFile);

        } catch (error) {
            console.error('Play error:', error);
            let errorMsg = '❌ Failed to process request.';
            if (error.response) {
                errorMsg = `❌ API error: ${error.response.status}`;
            }
            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};
