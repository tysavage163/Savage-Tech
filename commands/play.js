const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const { jidNormalizedUser } = require("@whiskeysockets/baileys");

module.exports = {
    name: "play",
    description: "Search and play music from YouTube",
    category: "download",
    async execute(sock, m, { args, from, reply, text }) {
        if (!text) return reply("❌ Please provide a song name.\nExample: .play Bruno Mars Die With A Smile");

        try {
            reply(`⏳ *SΛVΛGΞ-TECH is searching...*`);

            // 🔍 Search YouTube
            const search = await yts(text);
            const video = search.videos[0];

            if (!video) return reply("❌ Song not found. Try a different title.");

            let playMsg = `⛓️ *SΛVΛGΞ-TECH MUSIC* ⛓️\n\n` +
                          `📝 *Title:* ${video.title}\n` +
                          `⏱️ *Duration:* ${video.timestamp}\n` +
                          `👁️ *Views:* ${video.views}\n` +
                          `🔗 *Link:* ${video.url}\n\n` +
                          `*Sending audio... stay still...*`;

            // Send Thumbnail + Info
            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: playMsg 
            }, { quoted: m });

            // 📥 Download Audio
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            const filePath = `./${Date.now()}.mp3`;

            // Pipe to temporary file
            const writer = fs.createWriteStream(filePath);
            stream.pipe(writer);

            writer.on('finish', async () => {
                // 📤 Send Audio to Group/Chat
                await sock.sendMessage(from, { 
                    audio: { url: filePath }, 
                    mimetype: 'audio/mp4', 
                    ptt: false 
                }, { quoted: m });

                // 📝 Log to Private DM
                const logUser = jidNormalizedUser(sock.user.id);
                await sock.sendMessage(logUser, { 
                    text: `⛓️ *SΛVΛGΞ-TECH DOWNLOAD LOG*\n*Song:* ${video.title}\n*Requested in:* ${from}\n*Status:* Delivered ✅` 
                });

                // Delete temp file to save Termux storage
                fs.unlinkSync(filePath);
            });

        } catch (err) {
            console.error(err);
            reply("❌ Error processing audio. YouTube might be blocking the request.");
        }
    }
};
