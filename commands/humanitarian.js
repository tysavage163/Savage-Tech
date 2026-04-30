// humanizer.js – Rewrite AI text to sound human
const axios = require('axios');

module.exports = {
  name: 'humanizer',
  category: 'tools',
  description: 'Convert AI-generated text to human-like',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Provide AI text to humanize.' });

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/humanizer', { text });
      if (response.data.status === true) {
        const humanText = response.data.result || response.data.humanized || 'No humanized text returned.';
        await sock.sendMessage(msg.key.remoteJid, { text: `👤 *Humanized:*\n${humanText.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${response.data.error || 'Humanizer failed.'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Humanizer API error.' });
    }
  }
};
