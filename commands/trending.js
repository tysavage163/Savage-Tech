const axios = require('axios');

module.exports = {
    name: 'trending',
    category: 'download',
    description: 'Get trending music from YouTube',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        await sock.sendMessage(from, { text: '🔥 Fetching trending music...' }, { quoted: msg });

        try {
            const response = await axios({
                method: 'get',
                url: 'https://apis.xwolf.space/api/trending',
                timeout: 15000,
                headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36' }
            });

            let trendingList = response.data.trending || response.data.result || response.data;
            if (!trendingList || !trendingList.length) {
                return sock.sendMessage(from, { text: '❌ No trending data found.' }, { quoted: msg });
            }

            let caption = '🔥 *TRENDING MUSIC ON YOUTUBE*\n\n';
            for (let i = 0; i < Math.min(trendingList.length, 10); i++) {
                const item = trendingList[i];
                const title = item.title || item.name || 'Unknown';
                const uploader = item.uploader || item.channel || item.author || 'Unknown';
                const url = item.url || item.link || '';
                caption += `${i+1}. *${title}*\n   👤 ${uploader}\n   🔗 ${url}\n\n`;
            }
            caption += `_⚡ Powered by Savage-Tech_`;

            await sock.sendMessage(from, { text: caption }, { quoted: msg });
        } catch (error) {
            console.error('Trending error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to fetch trending music. Try again later.' }, { quoted: msg });
        }
    }
};
