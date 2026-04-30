// deepseek.js – WhatsApp AI command
const axios = require('axios');

module.exports = {
  name: 'deepseek',
  category: 'tools',        // optional, for your menu
  description: 'Chat with DeepSeek AI',
  async execute(sock, msg, args, { isArchitect, isMe }) {
    const query = args.join(' ');
    if (!query) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❓ What do you want to ask DeepSeek?' });
      return;
    }

    try {
      const url = `https://apis.xwolf.space/api/ai/deepseek?q=${encodeURIComponent(query)}`;
      const response = await axios.get(url);

      if (response.data.status === true) {
        const reply = response.data.result || 'No response.';
        await sock.sendMessage(msg.key.remoteJid, { text: `🤖 *DeepSeek:*\n${reply.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ API error: ${response.data.error || 'Unknown'}` });
      }
    } catch (error) {
      console.error('DeepSeek error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to reach DeepSeek API.' });
    }
  }
};
