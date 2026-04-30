const axios = require('axios');

module.exports = {
  name: 'play12',
  category: 'audio',
  description: 'Get trending music from YouTube',
  async execute(sock, msg, args) {
    const senderName = msg.pushName || 'User';
    try {
      const url = 'https://apis.xwolf.space/api/trending';
      const res = await axios.get(url);
      if (res.data.success) {
        let trending = res.data.result || res.data.data || [];
        if (Array.isArray(trending) && trending.length) {
          let text = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n🔥 *Trending songs for @${senderName}*\n\n`;
          trending.slice(0, 10).forEach((item, i) => {
            text += `${i+1}. ${item.title || item.name} - ${item.artist || ''}\n`;
          });
          text += `\nInspired by Meryl`;
          await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000) });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\nNo trending data found.\n\nInspired by Meryl` });
        }
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ ${res.data.error || 'Failed to fetch trending songs'}\n\nInspired by Meryl` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ Trending API error.\n\nInspired by Meryl` });
    }
  }
};
