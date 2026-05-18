const axios = require('axios');

module.exports = {
    name: 'lyrics',
    category: 'audio',
    description: 'Get song lyrics by name',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const query = args.join(' ');
        if (!query) {
            return sock.sendMessage(from, { text: '📝 Usage: .lyrics <song name>' }, { quoted: msg });
        }

        await sock.sendMessage(from, { text: '🔍 Searching for lyrics...' }, { quoted: msg });

        try {
            const endpoint = `https://apis.xwolf.space/download/Lyrics?q=${encodeURIComponent(query)}`;
            const response = await axios({
                method: 'get',
                url: endpoint,
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            let lyrics = response.data.lyrics || response.data.result || response.data.text;
            if (!lyrics) {
                return sock.sendMessage(from, { text: '❌ No lyrics found for that song.' }, { quoted: msg });
            }

            if (lyrics.length > 4096) {
                lyrics = lyrics.slice(0, 4000) + '\n\n... (truncated)';
            }

            const caption = `📝 *LYRICS*\n🎵 *Song:* ${query}\n\n${lyrics}\n\n_⚡ Powered by Savage-Tech_`;
            await sock.sendMessage(from, { text: caption }, { quoted: msg });
        } catch (error) {
            console.error('Lyrics error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to fetch lyrics. Try another song name.' }, { quoted: msg });
        }
    }
};
