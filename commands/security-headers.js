const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'security-headers',
  category: 'ethical hacking',
  description: 'Check security headers with Mozilla Observatory',
  async execute(sock, msg, args) {
    let host = args[0];
    if (!host) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .security-headers <domain>' });
    host = host.replace(/^https?:\/\//, '');
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Scanning security headers for ${host}...`, mentions: [jid] });
      const res = await axios.get(`https://http-observatory.security.mozilla.org/api/v1/analyze?host=${encodeURIComponent(host)}`, { httpsAgent: agent });
      const data = res.data;
      let text = `🛡️ Observatory Score: ${data.score || 'N/A'}\n`;
      text += `Grade: ${data.grade || 'N/A'}\n`;
      if (data.tests) {
        text += `Passed tests: ${Object.values(data.tests).filter(t => t.pass).length}/${Object.keys(data.tests).length}\n`;
      }
      const output = `🛡️ *Security Headers Scan*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${host}\n\n${text}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output, mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Scan failed: ${err.message}` });
    }
  }
};
