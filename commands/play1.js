const axios = require('axios');

module.exports = {
  name: 'play1',
  category: 'audio',
  description: 'Search for songs by keyword',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play1 song name' });

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🔍 *Savage-Tech is searching for "${query}" @${senderName}...*` });

    try {
      const url = `https://apis.xwolf.space/api/search?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      if (res.data.success) {
        let results = res.data.result || res.data.data || [];
        if (Array.isArray(results) && results.length) {
          let text = `🔍 *Results for "${query}":*\n`;
          results.slice(0, 10).forEach((item, i) => {
            text += `${i+1}. ${item.title || item.name} - ${item.artist || ''}\n`;
          });
          await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000) });
        } else {
          await sock.sendMessage(msg.key.remoteJid, { text: 'No results found.' });
        }
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Search failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Search API error.' });
    }
  }
};
