const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'email-validate',
  category: 'tools',
  description: 'Validate email format',
  async execute(sock, msg, args) {
    const email = args[0];
    if (!email || !email.includes('@')) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .email-validate <email>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/email-validate?email=${encodeURIComponent(email)}`, { httpsAgent: agent });
      const isValid = res.data.valid ? '✅ Valid email' : '❌ Invalid email';
      const result = res.data.result || isValid;
      await sock.sendMessage(msg.key.remoteJid, { text: `📧 *Email Validation for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
