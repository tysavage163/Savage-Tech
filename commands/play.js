const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    name: 'play',
    category: 'tools',
    description: 'Download audio from YouTube by searching for a song name.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        
        if (!query) {
            return await sock.sendMessage(from, { text: '❌ Provide a song name or YouTube link.\nExample: .play Ed Sheeran Shape of You' });
        }

        await sock.sendMessage(from, { text: `⏳ Searching \`${query}\` on YouTube...` });

        try {
            let videoUrl = query;
            let videoTitle = '';

            if (!query.includes('youtube.com/watch?v=') && !query.includes('youtu.be/')) {
                const searchResults = await yts(query);
                const firstResult = searchResults.videos[0];
                if (!firstResult) throw new Error('No results');
                videoUrl = firstResult.url;
                videoTitle = firstResult.title;
            } else {
                const videoInfo = await ytdl.getInfo(videoUrl);
                videoTitle = videoInfo.videoDetails.title;
            }

            const audioOutputPath = path.resolve(__dirname, `../temp_audio_${Date.now()}.mp3`);
            const audioStream = ytdl(videoUrl, { filter: 'audioonly', quality: 'lowestaudio' });
            const writeStream = fs.createWriteStream(audioOutputPath);
            audioStream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                audioStream.on('error', reject);
            });

            const musicQuotes = [
                "Every beat is a step closer to greatness. 🎶",
                "Stay savage, keep the bass heavy.",
                "Music is the weapon of the future.",
                "Rhythm is the heartbeat of the savage.",
                "Play it loud, play it proud.",
                "Legends are made of bass drops and grind.",
                "Your vibe attracts your tribe – drop the track.",
                "Silence is broken by the savage's anthem.",
                "Don't just listen – feel the frequency.",
                "Hustle in silence, let the music speak.",
                "Every dream has its own soundtrack.",
                "Wake up. Drop the beat. Dominate.",
                "The savage doesn't wait for the drop – he creates it.",
                "Your only limit is the volume knob.",
                "Pain fades, but a great track is forever.",
                "No pressure, no diamonds – no bass, no fire.",
                "From the streets to the speakers – savage mode.",
                "Let the rhythm remind you who you are.",
                "Don't chase the vibe – be the vibe.",
                "The same fire that burns the weak melts the fearful.",
                "Turn it up. They'll hear you coming.",
                "Beat drops. Haters stop.",
                "Savage by nature, loud by choice.",
                "Every lyric is a lesson.",
                "Your playlist is your autobiography – make it savage."
            ];
            const randomQuote = musicQuotes[Math.floor(Math.random() * musicQuotes.length)];
            const watermark = `╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            const caption = `🎵 *Now Playing:* ${videoTitle}\n📥 *Requested by:* @${msg.key.participant?.split('@')[0] || 'You'}\n\n“${randomQuote}”\n\n${watermark}`;

            await sock.sendMessage(from, {
                audio: { url: audioOutputPath },
                mimetype: 'audio/mpeg',
                fileName: `${videoTitle}.mp3`,
                caption: caption,
                mentions: [msg.key.participant || msg.key.remoteJid]
            });

            fs.unlink(audioOutputPath).catch(console.error);
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ Failed to play. YouTube may be blocking or try again later.' });
        }
    }
};
