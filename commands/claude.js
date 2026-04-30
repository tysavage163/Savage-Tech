// claude.js – Claude-style AI
const axios = require('axios');

module.exports = {
  name: 'claude',
  category: 'ai',
  description: 'Chat with Claude-style AI',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❓ What do you want to ask Claude?' });
      return;
    }

    try {
      const url = `https://apis.xwolf.space/api/ai/claude?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);

      if (response.data.status === true) {
        const reply = response.data.result || 'No response.';
        await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *Claude:*\n${reply.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ API error: ${response.data.error || 'Unknown'}` });
      }
    } catch (error) {
      console.error('Claude error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to reach Claude API.' });
    }
  }
};
