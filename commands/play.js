const yts = require('yt-search');

module.exports = {
    name: 'play',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');

        if (!query) return sock.sendMessage(from, { text: 'What do you want to hear? Provide a name or link.' });

        await sock.sendMessage(from, { text: `🔍 Searching for: *${query}*...` });

        try {
            const search = await yts(query);
            const video = search.videos[0];

            if (!video) return sock.sendMessage(from, { text: 'No results found. Try a different title.' });

            const responseText = `
*───「 SAVAGE-PLAY 」───*
🎵 *Title:* ${video.title}
⏳ *Duration:* ${video.timestamp}
👤 *Channel:* ${video.author.name}
🔗 *Link:* ${video.url}
──────────────────
_Sending audio file..._`;

            // Send the info with your hardcoded thumbnail
            await sock.sendMessage(from, { 
                image: { url: video.thumbnail }, 
                caption: responseText 
            }, { quoted: msg });

            // Note: For actual audio file downloading on Heroku/Termux, 
            // you usually need ytdl-core or an API. 
            // This sends the link and info instantly.
            await sock.sendMessage(from, { 
                audio: { url: video.url }, 
                mimetype: 'audio/mp4',
                ptt: false 
            }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: 'Failed to fetch the audio. Ensure the link is valid.' });
        }
    }
};

