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

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎵 *AUDIO DOWNLOADER*\n- *Title:* ${title}\n- *Duration:* ${duration}\n- *Views:* ${views}\n- *Author:* ${author}\n- *Status:* Downloading...\n- *Powered by Savage-Tech*`
            }, { quoted: msg });

            const endpoints = [
                `https://apis.xwolf.space/download/yta2?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/yta?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/audio?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/dlmp3?url=${encodeURIComponent(videoUrl)}`
            ];

            let audioBuffer = null;

            for (const endpoint of endpoints) {
                try {
                    const response = await axios({
                        method: 'get',
                        url: endpoint,
                        timeout: 15000,
                        headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' },
                        responseType: 'json'
                    });

                    let audioUrl = null;
                    if (response.data.downloaded_at) {
                        audioUrl = response.data.downloaded_at;
                    } else if (response.data.result?.url) {
                        audioUrl = response.data.result.url;
                    } else if (response.data.url) {
                        audioUrl = response.data.url;
                    } else if (response.data.download_url) {
                        audioUrl = response.data.download_url;
                    } else if (response.data.link) {
                        audioUrl = response.data.link;
                    }

                    if (audioUrl && typeof audioUrl === 'string') {
                        const audioRes = await axios({
                            method: 'get',
                            url: audioUrl,
                            responseType: 'arraybuffer',
                            timeout: 30000,
                            headers: { 'User-Agent': 'Mozilla/5.0' }
                        });
                        const buffer = Buffer.from(audioRes.data);
                        if (buffer.length > 50000) {
                            audioBuffer = buffer;
                            break;
                        }
                    } else if (response.data && Buffer.isBuffer(response.data) && response.data.length > 50000) {
                        audioBuffer = response.data;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!audioBuffer) {
                return sock.sendMessage(from, { text: '❌ Could not download audio. Try another song or use a YouTube URL directly.' }, { quoted: msg });
            }

            const fileSizeMB = (audioBuffer.length / (1024 * 1024)).toFixed(2);
            if (audioBuffer.length > 16 * 1024 * 1024) {
                return sock.sendMessage(from, { text: `❌ Audio too large (${fileSizeMB} MB). Max 16 MB.` }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp3`);
            fs.writeFileSync(tempFile, audioBuffer);

            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                ptt: false
            }, { quoted: msg });

            fs.unlinkSync(tempFile);
        } catch (error) {
            console.error('Play error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to download. Try again later.' }, { quoted: msg });
        }
    }
};
