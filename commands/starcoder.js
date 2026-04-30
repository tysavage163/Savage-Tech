const axios = require('axios');

module.exports = {
  name: 'starcoder',
  category: 'ai',
  description: 'Chat with StarCoder - code generation AI',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ What code do you want StarCoder to write?' });
    try {
      const url = `https://apis.xwolf.space/api/ai/starcoder?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const reply = res.data.status ? (res.data.result || 'No response') : `⚠️ ${res.data.error}`;
      await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *StarCoder:*\n${reply.slice(0, 2000)}` });
    } catch { await sock.sendMessage(msg.key.remoteJid, { text: '❌ API error' }); }
  }
};
