const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core'); // More stable than standard ytdl
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

module.exports = {
    name: 'play',
    category: 'media',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return sock.sendMessage(from, { text: '🎵 *SΛVΛGΞ*: What are we listening to?' });

        try {
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return sock.sendMessage(from, { text: '❌ Content not found.' });

            const infoText = `
━━━ 「 *SAVAGE-PLAY* 」 ━━━
🎵 *Title:* ${video.title}
⏳ *Duration:* ${video.timestamp}
🔗 *Link:* ${video.url}
━━━━━━━━━━━━━━━━━━━━
_Processing audio..._`;

            // Send Thumbnail + Info
            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: msg });

            // Download & Convert
            const filePath = `./${Date.now()}.mp3`;
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });

            ffmpeg(stream)
                .toFormat('mp3')
                .on('end', async () => {
                    await sock.sendMessage(from, { 
                        audio: fs.readFileSync(filePath), 
                        mimetype: 'audio/mp4',
                        fileName: `${video.title}.mp3`
                    }, { quoted: msg });
                    fs.unlinkSync(filePath); // Cleanup
                })
                .on('error', (err) => {
                    console.error(err);
                    sock.sendMessage(from, { text: '❌ Playback Error: Stream Interrupted.' });
                })
                .save(filePath);

        } catch (e) {
            console.error(e);
            sock.sendMessage(from, { text: '❌ YouTube blocked the connection. Try again in a moment.' });
        }
    }
};
