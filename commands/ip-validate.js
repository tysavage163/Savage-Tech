const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'ip-validate',
  category: 'tools',
  description: 'Validate IP address',
  async execute(sock, msg, args) {
    const ip = args[0];
    if (!ip) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .ip-validate <ip_address>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/ip-validate?ip=${encodeURIComponent(ip)}`, { httpsAgent: agent });
      const isValid = res.data.valid ? '✅ Valid IP' : '❌ Invalid IP';
      const result = res.data.result || isValid;
      await sock.sendMessage(msg.key.remoteJid, { text: `🌐 *IP Validation for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
