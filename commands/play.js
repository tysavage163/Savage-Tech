const yts = require('yt-search');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

module.exports = {
    name: 'play',
    category: 'media',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return sock.sendMessage(from, { text: '🎧 *Savage-Play*: Provide a song name.' });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: '❌ Song not found.' });

            // 1. Send the Metadata (Image + Details)
            const infoText = `
━━━ 「 *SAVAGE-PLAY* 」 ━━━
🎵 *Title:* ${video.title}
⏳ *Duration:* ${video.timestamp}
👤 *Channel:* ${video.author.name}
🔗 *Link:* ${video.url}
━━━━━━━━━━━━━━━━━━━━
_Sending audio file..._`;

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: msg });

            // 2. Process Audio
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            const filePath = `./${Date.now()}.mp3`;

            // We use FFmpeg to ensure the audio is encoded correctly for WhatsApp
            ffmpeg(stream)
                .audioBitrate(128)
                .save(filePath)
                .on('end', async () => {
                    // 3. Send the verified audio file
                    await sock.sendMessage(from, { 
                        audio: fs.readFileSync(filePath), 
                        mimetype: 'audio/mp4', // Most stable for WA
                        fileName: `${video.title}.mp3`
                    }, { quoted: msg });

                    // Clean up temp file
                    fs.unlinkSync(filePath);
                })
                .on('error', (err) => {
                    console.error(err);
                    sock.sendMessage(from, { text: '❌ Error processing audio.' });
                });

        } catch (e) {
            console.error(e);
            sock.sendMessage(from, { text: '❌ System Error: YouTube blocked the request.' });
        }
    }
};
