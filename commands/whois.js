const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'whois',
  category: 'ethical hacking',
  description: 'WHOIS domain lookup',
  async execute(sock, msg, args) {
    const domain = args[0];
    if (!domain) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .whois <domain>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔎 Looking up WHOIS for ${domain}...`, mentions: [jid] });
      const res = await axios.get(`https://who-dat.as93.net/${domain}`, { httpsAgent: agent });
      const data = res.data;
      let text = `📋 WHOIS for ${domain}\n`;
      text += `Registrar: ${data.registrar || 'N/A'}\n`;
      text += `Creation: ${data.creation_date || 'N/A'}\n`;
      text += `Expiry: ${data.expiry_date || 'N/A'}\n`;
      text += `Name Servers: ${data.name_servers ? data.name_servers.join(', ') : 'N/A'}`;
      const output = `🛡️ *WHOIS Lookup*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${domain}\n\n${text}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ WHOIS error: ${err.message}` });
    }
  }
};
