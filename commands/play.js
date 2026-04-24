const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');

module.exports = {
    name: 'play',
    category: 'media',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return sock.sendMessage(from, { text: '🎵 *SΛVΛGΞ*: Provide a search query.' });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: '❌ Video not found.' });

            // 1. Instant Feedback with Metadata
            const infoText = `
━━━ 「 *SAVAGE-PLAY* 」 ━━━
🎵 *Title:* ${video.title}
⏳ *Duration:* ${video.timestamp}
🔗 *Link:* ${video.url}
━━━━━━━━━━━━━━━━━━━━
_⚡ Optimizing and Sending..._`;

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: msg });

            const filePath = `./${Date.now()}.mp3`;

            // 2. Optimized Downloader Settings
            const downloadStream = ytdl(video.url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25, // Large 32MB buffer
                dlChunkSize: 0,         // Disables chunking for faster local downloads
            });

            // 3. Conversion Wrapper
            const convertAudio = () => {
                return new Promise((resolve, reject) => {
                    ffmpeg(downloadStream)
                        .audioBitrate(128)
                        .toFormat('mp3')
                        .on('end', () => resolve())
                        .on('error', (err) => reject(err))
                        .save(filePath);
                });
            };

            // Execute Conversion
            await convertAudio();

            // 4. Final Delivery
            await sock.sendMessage(from, { 
                audio: fs.readFileSync(filePath), 
                mimetype: 'audio/mp4',
                fileName: `${video.title}.mp3`
            }, { quoted: msg });

            // 5. Atomic Cleanup
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        } catch (e) {
            console.error('Savage-Play Error:', e);
            sock.sendMessage(from, { text: '❌ Playback Error: System Overload or YouTube Block.' });
        }
    }
};
