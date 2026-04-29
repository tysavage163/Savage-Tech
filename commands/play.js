const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'play',
    category: 'tools',
    description: 'Download audio from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(from, { text: '❌ Usage: .play song name' });
        }

        await sock.sendMessage(from, { text: `🔍 Searching \`${query}\` on YouTube...` });

        try {
            let videoUrl = query;
            let videoTitle = '';

            if (!query.includes('youtube.com/watch?v=') && !query.includes('youtu.be/')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) throw new Error('No results');
                const first = searchResults.videos[0];
                videoUrl = first.url;
                videoTitle = first.title;
            } else {
                const info = await ytdl.getInfo(videoUrl);
                videoTitle = info.videoDetails.title;
            }

            const tempPath = path.join(__dirname, `../temp_${Date.now()}.mp3`);
            const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'lowestaudio' });
            const writeStream = fs.createWriteStream(tempPath);
            stream.pipe(writeStream);

            await new Promise((res, rej) => {
                writeStream.on('finish', res);
                writeStream.on('error', rej);
                stream.on('error', rej);
            });

            const quotes = [
                "Every beat is a step closer to greatness. 🎶",
                "Stay savage, keep the bass heavy.",
                "Music is the weapon of the future.",
                "Rhythm is the heartbeat of the savage.",
                "Play it loud, play it proud."
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const watermark = `╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            const caption = `🎵 *Now Playing:* ${videoTitle}\n📥 *Requested by:* @${msg.key.participant?.split('@')[0] || 'You'}\n\n“${randomQuote}”\n\n${watermark}`;

            await sock.sendMessage(from, {
                audio: { url: tempPath },
                mimetype: 'audio/mpeg',
                fileName: `${videoTitle}.mp3`,
                caption: caption,
                mentions: [msg.key.participant || msg.key.remoteJid]
            });

            await fs.unlink(tempPath).catch(console.error);
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ Failed to play. Try a different song name.' });
        }
    }
};
