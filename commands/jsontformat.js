const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'jsontformat',
  category: 'tools',
  description: 'Format/validate JSON',
  async execute(sock, msg, args) {
    const json = args.join(' ');
    if (!json) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .jsontformat <json_string>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.post('https://apis.xwolf.space/api/tools/jsontformat', { json }, { httpsAgent: agent });
      const result = res.data.result || res.data.formatted || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📝 *JSON Formatted for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
