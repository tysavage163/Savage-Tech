// commands/play.js
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'play',
    category: 'tools',
    description: 'Download and play audio from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return await sock.sendMessage(from, { text: '❌ Please provide a song name or YouTube link.\nExample: .play Ed Sheeran Shape of You' });
        }

        await sock.sendMessage(from, { text: `⏳ Searching for \`${query}\` on YouTube...` });

        try {
            // 1. Search for the video
            let videoUrl = query;
            let videoTitle = '';

            if (!query.includes('youtube.com/watch?v=') && !query.includes('youtu.be/')) {
                const searchResults = await yts(query);
                const firstResult = searchResults.videos[0];
                if (!firstResult) throw new Error('No results found.');
                videoUrl = firstResult.url;
                videoTitle = firstResult.title;
            } else {
                // If it's a direct link, get its info for the title
                const videoInfo = await ytdl.getInfo(videoUrl);
                videoTitle = videoInfo.videoDetails.title;
            }

            // 2. Create a temporary file path
            const tempAudioPath = path.resolve(__dirname, `../temp_audio_${Date.now()}.mp3`);

            // 3. Download the audio stream
            const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'lowestaudio' });
            const writeStream = fs.createWriteStream(tempAudioPath);
            audioStream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                audioStream.on('error', reject);
            });

            // 4. Prepare the success message with a random savage music quote
            const musicQuotes = [
                "Every beat is a step closer to greatness. 🎶",
                "Stay savage, keep the bass heavy.",
                "Music is the weapon of the future.",
                // ... you can add more quotes here ...
            ];
            const randomQuote = musicQuotes[Math.floor(Math.random() * musicQuotes.length)];
            const watermark = `╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            const caption = `🎵 *Now Playing:* ${videoTitle}\n📥 *Requested by:* @${msg.key.participant?.split('@')[0] || 'You'}\n\n“${randomQuote}”\n\n${watermark}`;

            // 5. Send the audio file
            await sock.sendMessage(from, {
                audio: { url: tempAudioPath },
                mimetype: 'audio/mpeg',
                fileName: `${videoTitle}.mp3`,
                caption: caption,
                mentions: [msg.key.participant || msg.key.remoteJid]
            });

            // 6. Clean up the temporary file
            await fs.unlink(tempAudioPath).catch(console.error);
        } catch (error) {
            console.error('Play command error:', error);
            await sock.sendMessage(from, { text: '❌ Could not process the song. Please try a different link or search term.' });
        }
    }
};
