const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const yts = require('yt-search');
const util = require('util');
const execPromise = util.promisify(exec);

module.exports = {
    name: 'play',
    category: 'tools',
    description: 'Download audio from YouTube (yt-dlp backend)',
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

            // If not a direct YouTube link, search
            if (!query.includes('youtube.com/watch?v=') && !query.includes('youtu.be/')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) throw new Error('No results');
                const first = searchResults.videos[0];
                videoUrl = first.url;
                videoTitle = first.title;
            } else {
                // Get title via yt-dlp (quick info)
                const { stdout } = await execPromise(`yt-dlp --get-title "${videoUrl}"`);
                videoTitle = stdout.trim();
            }

            // Temporary file path
            const tempFile = path.join(__dirname, `../temp_${Date.now()}.mp3`);

            // Download audio using yt-dlp
            await execPromise(`yt-dlp -f bestaudio --extract-audio --audio-format mp3 --output "${tempFile}" "${videoUrl}"`);

            // Random savage music quote
            const quotes = [
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
                "The same fire that melts butter hardens steel.",
                "Turn it up. They'll hear you coming.",
                "Beat drops. Haters stop.",
                "Savage by nature, loud by choice.",
                "Every lyric is a lesson.",
                "Your playlist is your autobiography – make it savage."
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            const watermark = `╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            const caption = `🎵 *Now Playing:* ${videoTitle}\n📥 *Requested by:* @${msg.key.participant?.split('@')[0] || 'You'}\n\n“${randomQuote}”\n\n${watermark}`;

            // Send audio
            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${videoTitle}.mp3`,
                caption: caption,
                mentions: [msg.key.participant || msg.key.remoteJid]
            });

            // Clean up
            await fs.unlink(tempFile).catch(console.error);
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ Failed to play. Try a different song or check your internet connection.' });
        }
    }
};
