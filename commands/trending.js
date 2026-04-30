// trending.js - Get trending music from YouTube
const axios = require('axios');

module.exports = {
  name: 'trending',
  category: 'audio',
  description: 'Get trending music from YouTube',
  async execute(sock, msg, args) {
    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🔥 *Savage-Tech is fetching trending songs for @${senderName}...*` });

    try {
      const url = 'https://apis.xwolf.space/api/trending';
      const res = await axios.get(url);
      if (res.data.success) {
        let trending = res.data.result || res.data.data || [];
        if (Array.isArray(trending) && trending.length) {
          let text = `🔥 *Trending songs:*\n`;
          trending.slice(0, 10).forEach((item, i) => {
            text += `${i+1}. ${item.title || item.name} - ${item.artist || ''}\n`;
          });
          await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000) });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { text: 'No trending data found.' });
        }
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed to fetch trending songs'}` });
      }
    } catch (error) {
      console.error('Trending error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Trending API error.' });
    }
  }
};
