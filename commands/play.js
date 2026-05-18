const fs = require('fs');
const path = require('path');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    name: 'play',
    category: 'download',
    description: 'Download audio from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '🎵 Usage: .play <song name or YouTube URL>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for audio...' }, { quoted: msg });

        try {
            let videoUrl = query;
            if (!query.includes('youtube.com') && !query.includes('youtu.be')) {
                const searchResults = await yts(query);
                if (!searchResults.videos.length) {
                    return sock.sendMessage(from, { text: '❌ No results found.' }, { quoted: msg });
                }
                videoUrl = searchResults.videos[0].url;
            }

            const videoId = videoUrl.split('v=')[1]?.split('&')[0] || videoUrl.split('youtu.be/')[1]?.split('?')[0];
            if (!videoId) {
                return sock.sendMessage(from, { text: '❌ Invalid YouTube URL.' }, { quoted: msg });
            }

            const info = await yts({ videoId });
            const title = info.title || 'Unknown Title';
            const duration = info.duration.timestamp || 'Unknown';
            const views = info.views?.toLocaleString() || 'Unknown';
            const author = info.author?.name || 'Unknown';
            const thumbnail = info.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

            await sock.sendMessage(from, {
                image: { url: thumbnail },
                caption: `🎵 *AUDIO DOWNLOADER*\n- *Title:* ${title}\n- *Duration:* ${duration}\n- *Views:* ${views}\n- *Author:* ${author}\n- *Status:* Downloading...\n- *Powered by Savage-Tech*`
            }, { quoted: msg });

            const stream = ytdl(videoUrl, { 
                filter: 'audioonly',
                quality: 'lowestaudio'
            });

            const chunks = [];
            let size = 0;
            for await (const chunk of stream) {
                chunks.push(chunk);
                size += chunk.length;
                if (size > 16 * 1024 * 1024) {
                    stream.destroy();
                    return sock.sendMessage(from, { text: '❌ Audio too large (over 16 MB).' }, { quoted: msg });
                }
            }

            const audioBuffer = Buffer.concat(chunks);
            if (audioBuffer.length === 0) {
                return sock.sendMessage(from, { text: '❌ Failed to download audio.' }, { quoted: msg });
            }

            const tempDir = path.join(__dirname, '../temp');
            if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
            const tempFile = path.join(tempDir, `${videoId}.mp3`);
            fs.writeFileSync(tempFile, audioBuffer);

            await sock.sendMessage(from, {
                audio: { url: tempFile },
                mimetype: 'audio/mpeg',
                fileName: `${title.replace(/[^a-z0-9]/gi, '_')}.mp3`,
                ptt: false
            }, { quoted: msg });

            fs.unlinkSync(tempFile);
        } catch (error) {
            console.error('Play error:', error);
            let errorMsg = '❌ Failed to download. ';
            if (error.message.includes('extract')) errorMsg += 'YouTube signature issue. Try updating the bot.';
            else errorMsg += error.message;
            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};
