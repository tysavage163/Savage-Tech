const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'song',
    category: 'audio',
    description: 'Download audio by song name',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .song <song name>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for song...' }, { quoted: msg });

        try {
            const endpoint = `https://apis.xwolf.space/download/mp3?q=${encodeURIComponent(query)}`;
            const response = await axios({
                method: 'get',
                url: endpoint,
                timeout: 20000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            let audioUrl = response.data.downloadUrl || response.data.downloaded_at || response.data.url || response.data.result?.url || response.data.link;
            let title = response.data.title || query;
            let thumbnail = response.data.thumbnail || response.data.thumb || '';

            if (!audioUrl) {
                return sock.sendMessage(from, { text: '❌ No audio URL found for that song.' }, { quoted: msg });
            }

            const audioRes = await axios({
                method: 'get',
                url: audioUrl,
                responseType: 'arraybuffer',
                timeout: 60000,
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
            const tempFile = path.join(tempDir, `song_${Date.now()}.mp3`);
            fs.writeFileSync(tempFile, audioBuffer);

            const caption = `🎵 *SONG DOWNLOADER*\n♡ *Title:* ${title}\n♡ *Size:* ${fileSizeMB} MB\n\n_⚡ Powered by Savage-Tech_`;

            if (thumbnail) {
                await sock.sendMessage(from, {
                    image: { url: thumbnail },
                    caption: caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: caption }, { quoted: msg });
            }

            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                ptt: false
            }, { quoted: msg });

            fs.unlinkSync(tempFile);
        } catch (error) {
            console.error('Song error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to download song. Try another name or use .play with a YouTube URL.' }, { quoted: msg });
        }
    }
};
