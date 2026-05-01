const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'password-strength',
  category: 'tools',
  description: 'Check password strength',
  async execute(sock, msg, args) {
    const pwd = args.join(' ');
    if (!pwd) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .password-strength <password>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/password-strength?password=${encodeURIComponent(pwd)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.strength || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🔒 *Password Strength for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
