const axios = require('axios');

module.exports = {
  name: 'vicuna',
  category: 'ai',
  description: 'Chat with Vicuna chatbot',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Ask Vicuna?' });
    try {
      const url = `https://apis.xwolf.space/api/ai/vicuna?q=${encodeURIComponent(query)}`;
      const res = await axios.get(url);
      const reply = res.data.status ? (res.data.result || 'No response') : `⚠️ ${res.data.error}`;
      await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *Vicuna:*\n${reply.slice(0, 2000)}` });
    } catch { await sock.sendMessage(msg.key.remoteJid, { text: '❌ API error' }); }
  }
};
