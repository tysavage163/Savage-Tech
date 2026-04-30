// translate.js – AI translation (tools category)
const axios = require('axios');

module.exports = {
  name: 'translate',
  category: 'tools',
  description: 'Translate text to any language',
  async execute(sock, msg, args) {
    // Usage: .translate <text> --to <lang>   or   .translate <text> to <lang>
    let fullText = args.join(' ');
    if (!fullText) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .translate Hello world to es' });

    let targetLang = 'en'; // default
    let text = fullText;

    // Detect "to <lang>" or "--to <lang>" at the end
    const toMatch = fullText.match(/\s+(?:--to|to)\s+([a-z]{2,})$/i);
    if (toMatch) {
      targetLang = toMatch[1].toLowerCase();
      text = fullText.substring(0, toMatch.index).trim();
    }

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/translate', {
        text: text,
        to: targetLang,
        from: 'auto'
      });

      if (response.data.status === true) {
        const result = response.data.result || response.data.translated_text || 'Translation not found';
        await sock.sendMessage(msg.key.remoteJid, { text: `🌐 *Translation (${targetLang}):*\n${result.slice(0, 2000)}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ API error: ${response.data.error || 'Unknown'}` });
      }
    } catch (error) {
      console.error('Translate error:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to translate. Check API or network.' });
    }
  }
};
