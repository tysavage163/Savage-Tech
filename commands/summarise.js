// summarize.js – AI text summarization
const axios = require('axios');

module.exports = {
  name: 'summarize',
  category: 'tools',
  description: 'Summarize long text',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Provide text to summarize.' });

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/summarize', { text });
      if (response.data.status === true) {
        const summary = response.data.result || response.data.summary || 'No summary returned.';
        await sock.sendMessage(msg.key.remoteJid, { text: `📝 *Summary:*\n${summary.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${response.data.error || 'Summarization failed.'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Summarization API error.' });
    }
  }
};
