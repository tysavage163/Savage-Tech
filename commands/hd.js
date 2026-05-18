const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'hd',
    category: 'download',
    description: 'Download HD video (1080p/720p) from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎥 Usage: .hd <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for HD video...' }, { quoted: msg });

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

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎥 *HD VIDEO*\n♡ *Title:* ${title}\n♡ *Duration:* ${duration}\n♡ *Views:* ${views}\n♡ *Author:* ${author}\n♡ *Status:* Downloading HD...\n\n_⚡ Powered by Savage-Tech_`
            }, { quoted: msg });

            const endpoints = [
                `https://apis.xwolf.space/download/hd?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/mp4?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/video?url=${encodeURIComponent(videoUrl)}`
            ];

            let videoBuffer = null;
            for (const endpoint of endpoints) {
                try {
                    const response = await axios({
                        method: 'get',
                        url: endpoint,
                        timeout: 30000,
                        headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
                    });

                    let videoUrlResult = response.data.downloadUrl || response.data.downloaded_at || response.data.url || response.data.result?.url || response.data.link;
                    if (videoUrlResult) {
                        const videoRes = await axios({
                            method: 'get',
                            url: videoUrlResult,
                            responseType: 'arraybuffer',
                            timeout: 120000,
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });
                        videoBuffer = Buffer.from(videoRes.data);
                        if (videoBuffer.length > 50000) break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!videoBuffer || videoBuffer.length < 50000) {
                return sock.sendMessage(from, { text: '❌ No video data received. Try another song or use .mp4' }, { quoted: msg });
            }

            const fileSizeMB = (videoBuffer.length / (1024 * 1024)).toFixed(2);
            if (videoBuffer.length > 50 * 1024 * 1024) {
                return sock.sendMessage(from, { text: `❌ Video too large (${fileSizeMB} MB). Max 50 MB.` }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp4`);
            fs.writeFileSync(tempFile, videoBuffer);

            await sock.sendMessage(from, {
                video: { url: tempFile },
                mimetype: 'video/mp4',
                caption: `🎥 *HD: ${title}*\n_⚡ Powered by Savage-Tech_`
            }, { quoted: msg });

            fs.unlinkSync(tempFile);
        } catch (error) {
            console.error('HD error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to download HD video. Try another song or URL.' }, { quoted: msg });
        }
    }
};
