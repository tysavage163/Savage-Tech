const yts = require('yt-search');
const ytdl = require('ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "play",
    description: "Search and download audio from YouTube",
    category: "tools", // Integrated into your Tools menu
    async execute(sock, m, { args, from, reply, text }) {
        if (!text) return reply("⛓️ *SΛVΛGΞ-TECH*\nProvide a song name to search.\nExample: .play Bruno Mars");

        try {
            // 🔍 Search YouTube
            const search = await yts(text);
            const video = search.videos[0];
            if (!video) return reply("❌ No results found for that query.");

            reply(`⏳ *Fetching:* ${video.title}...`);

            // 📸 Send Preview Card
            const infoText = `⛓️ *SΛVΛGΞ TOOLS: AUDIO*\n\n` +
                             `*Title:* ${video.title}\n` +
                             `*Author:* ${video.author.name}\n` +
                             `*Duration:* ${video.timestamp}\n\n` +
                             `_Processing high-quality stream..._`;

            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: infoText 
            }, { quoted: m });

            // 📥 Download Path (Optimized for Termux)
            const filePath = path.join(__dirname, `../${Date.now()}.mp3`);
            const stream = ytdl(video.url, { 
                filter: 'audioonly', 
                quality: 'highestaudio' 
            });
            
            const writer = fs.createWriteStream(filePath);
            stream.pipe(writer);

            writer.on('finish', async () => {
                // 📤 Upload to WhatsApp
                await sock.sendMessage(from, { 
                    audio: { url: filePath }, 
                    mimetype: 'audio/mp4', 
                    ptt: false 
                }, { quoted: m });

                // 🗑️ Termux Storage Cleanup
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });

            writer.on('error', (err) => {
                console.error(err);
                reply("❌ Stream interrupted. Try again.");
            });

        } catch (err) {
            console.error(err);
            reply("❌ YouTube System Error. Ensure ytdl-core is updated.");
        }
    }
};
