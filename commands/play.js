const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('ytdl-core');

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

            // Send metadata with thumbnail first
            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎵 *AUDIO DOWNLOADER*\n- *Title:* ${title}\n- *Duration:* ${duration}\n- *Views:* ${views}\n- *Author:* ${author}\n- *Status:* Downloading...\n- *Powered by Savage-Tech*`
            }, { quoted: msg });

            let audioBuffer = null;
            let downloadSuccess = false;

            // Try xwolf.space API endpoints first
            const endpoints = [
                `https://apis.xwolf.space/download/yta2?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/yta?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/audio?url=${encodeURIComponent(videoUrl)}`,
                `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(videoUrl)}`
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await axios({
                        method: 'get',
                        url: endpoint,
                        responseType: 'arraybuffer',
                        timeout: 30000,
                        headers: { 'User-Agent': 'Savage-Tech-Bot' }
                    });
                    const contentType = response.headers['content-type'] || '';
                    const buffer = Buffer.from(response.data);
                    if (buffer.length > 50000 && (contentType.includes('audio') || buffer.slice(0, 3).toString() === 'ID3')) {
                        audioBuffer = buffer;
                        downloadSuccess = true;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            // Fallback to ytdl-core if API fails
            if (!downloadSuccess) {
                try {
                    const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'lowestaudio' });
                    const chunks = [];
                    for await (const chunk of stream) chunks.push(chunk);
                    audioBuffer = Buffer.concat(chunks);
                    downloadSuccess = true;
                } catch (e) {
                    console.error('ytdl-core error:', e);
                }
            }

            if (!downloadSuccess || !audioBuffer || audioBuffer.length === 0) {
                return sock.sendMessage(from, { text: '❌ Failed to download audio. Try another song or check API availability.' }, { quoted: msg });
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
            await sock.sendMessage(from, { text: '❌ An error occurred. Please try again later.' }, { quoted: msg });
        }
    }
};
