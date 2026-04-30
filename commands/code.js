// code.js – AI code generation assistant
const axios = require('axios');

module.exports = {
  name: 'code',
  category: 'tools',
  description: 'Generate code from description',
  async execute(sock, msg, args) {
    const prompt = args.join(' ');
    if (!prompt) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Describe the code you need.' });

    try {
      const response = await axios.post('https://apis.xwolf.space/api/ai/code', { prompt });
      if (response.data.status === true) {
        let code = response.data.result || response.data.code || 'No code generated.';
        // Trim and send as text (WhatsApp may format code poorly, but it's fine)
        await sock.sendMessage(msg.key.remoteJid, { text: `💻 *Generated Code:*\n\`\`\`\n${code.slice(0, 1900)}\n\`\`\`` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${response.data.error || 'Code generation failed.'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Code AI error.' });
    }
  }
};
