const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'dictionary',
  category: 'tools',
  description: 'Get word definition and meanings',
  async execute(sock, msg, args) {
    const word = args[0];
    if (!word) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .dictionary <word>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/dictionary?word=${encodeURIComponent(word)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.definition || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📚 *Dictionary: ${word} for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
