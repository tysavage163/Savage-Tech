const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core'); // Use the actively maintained fork

module.exports = {
    name: 'ytmp3',
    category: 'audio',
    description: 'Download audio directly from YouTube (No API)',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .ytmp3 <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Finding your audio...' }, { quoted: msg });

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
            const thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎵 *DOWNLOADING DIRECTLY*\n♡ *Title:* ${title}\n♡ *Status:* Downloading...\n\n_⚡ Powered by Savage-Tech_`
            }, { quoted: msg });

            // --- Download audio directly from YouTube ---
            const audioStream = ytdl(videoUrl, {
                filter: 'audioonly',
                quality: 'lowestaudio', // 'lowestaudio' is fastest, change to 'highestaudio' for better quality
            });

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp3`);
            const writer = fs.createWriteStream(tempFile);

            audioStream.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
                audioStream.on('error', reject);
            });

            const stats = fs.statSync(tempFile);
            if (stats.size === 0) {
                throw new Error('Downloaded file is empty.');
            }

            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                ptt: false
            }, { quoted: msg });

            fs.unlinkSync(tempFile);
            // --- End of direct download ---

        } catch (error) {
            console.error('YTMP3 error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to download. Please try another song.' }, { quoted: msg });
        }
    }
};
