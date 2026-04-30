const axios = require('axios');

module.exports = {
  name: 'play1',
  category: 'audio',
  description: 'Search for songs by keyword',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play1 song name' });

    const senderName = msg.pushName || 'User';
    try {
      const url = `https://apis.xwolf.space/api/search?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data.success) {
        let results = res.data.result || res.data.data || [];
        if (Array.isArray(results) && results.length) {
          let text = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n🔍 *Search results for "${query}"* (requested by @${senderName})\n\n`;
          results.slice(0, 10).forEach((item, i) => {
            text += `${i+1}. ${item.title || item.name} - ${item.artist || ''}\n`;
          });
          text += `\nInspired by Meryl`;
          await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000) });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\nNo results found for "${query}".\n\nInspired by Meryl` });
        }
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ ${res.data.error || 'Search failed'}\n\nInspired by Meryl` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ Search API error.\n\nInspired by Meryl` });
    }
  }
};
