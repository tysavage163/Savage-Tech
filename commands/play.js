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

            // Try to download with a custom agent and fallback qualities
            const agent = ytdl.createAgent(undefined, {
                // Mimic a real browser
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                }
            });

            const tempPath = path.join(__dirname, `../temp_${Date.now()}.mp3`);
            let stream;

            try {
                // Try lowest quality first (fastest)
                stream = ytdl(videoUrl, {
                    filter: 'audioonly',
                    quality: 'lowestaudio',
                    requestOptions: { agent }
                });
            } catch (firstErr) {
                // If lowest fails, try highest (older videos may only have high quality)
                stream = ytdl(videoUrl, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    requestOptions: { agent }
                });
            }

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
            let errorMsg = '❌ Failed to play this song.';
            if (err.message && err.message.includes('playable formats')) {
                errorMsg = '❌ This video is age-restricted or region-blocked.\nTry a different song.';
            } else if (err.message && err.message.includes('No results')) {
                errorMsg = '❌ No results found. Try a different search term.';
            }
            await sock.sendMessage(from, { text: errorMsg });
        }
    }
};
