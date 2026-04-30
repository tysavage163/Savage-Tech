const axios = require('axios');

module.exports = {
  name: 'dolphin',
  category: 'ai',
  description: 'Chat with Dolphin - uncensored AI',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ What do you want to ask Dolphin?' });
    try {
      const url = `https://apis.xwolf.space/api/ai/dolphin?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const reply = res.data.status ? (res.data.result || 'No response') : `⚠️ ${res.data.error}`;
      await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *Dolphin:*\n${reply.slice(0, 2000)}` });
    } catch { await sock.sendMessage(msg.key.remoteJid, { text: '❌ API error' }); }
  }
};
