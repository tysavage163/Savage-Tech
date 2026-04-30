const axios = require('axios');

module.exports = {
  name: 'solar',
  category: 'ai',
  description: 'Chat with Solar AI',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Question for Solar?' });
    try {
      const url = `https://apis.xwolf.space/api/ai/solar?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const reply = res.data.status ? (res.data.result || 'No response') : `⚠️ ${res.data.error}`;
      await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *Solar:*\n${reply.slice(0, 2000)}` });
    } catch { await sock.sendMessage(msg.key.remoteJid, { text: '❌ API error' }); }
  }
};
