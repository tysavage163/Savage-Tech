// scanner.js – Detect if text is AI-generated or human
const axios = require('axios');

module.exports = {
  name: 'scanner',
  category: 'tools',
  description: 'Detect AI-generated vs human text',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Provide text to analyze.' });

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/scanner', { text });
      if (response.data.status === true) {
        const result = response.data.result || response.data.prediction || 'Analysis result not found.';
        await sock.sendMessage(msg.key.remoteJid, { text: `🔍 *AI Scanner Result:*\n${result.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${response.data.error || 'Scanner failed.'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Scanner API error.' });
    }
  }
};
