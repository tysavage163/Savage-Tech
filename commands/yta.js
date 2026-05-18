const axios = require('axios');
const fs = require('fs');
const path = require('path');
const yts = require('yt-search');

module.exports = {
    name: 'yta',
    category: 'audio',
    description: 'YouTube Audio extractor (primary)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .yta <song name or YouTube URL>' }, { quoted: msg });
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
                caption: `🎵 *YTA EXTRACTOR*\n♡ *Title:* ${title}\n♡ *Duration:* ${duration}\n♡ *Views:* ${views}\n♡ *Author:* ${author}\n♡ *Status:* Extracting...\n\n_⚡ Powered by Savage-Tech_`
            }, { quoted: msg });

            const endpoint = `https://apis.xwolf.space/download/yta?url=${encodeURIComponent(videoUrl)}`;
            const response = await axios({
                method: 'get',
                url: endpoint,
                timeout: 30000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            let audioUrl = response.data.downloadUrl || response.data.downloaded_at || response.data.url || response.data.result?.url || response.data.link;
            if (!audioUrl) {
                return sock.sendMessage(from, { text: '❌ No audio URL in API response.' }, { quoted: msg });
            }

            const audioRes = await axios({
                method: 'get',
                url: audioUrl,
                responseType: 'arraybuffer',
                timeout: 90000,
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });

            const audioBuffer = Buffer.from(audioRes.data);
            if (audioBuffer.length < 50000) {
                return sock.sendMessage(from, { text: `❌ Downloaded file too small (${audioBuffer.length} bytes).` }, { quoted: msg });
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
            console.error('YTA error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to extract audio. Try another song or URL.' }, { quoted: msg });
        }
    }
};
