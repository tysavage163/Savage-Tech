const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'subdomain',
  category: 'ethical hacking',
  description: 'Find subdomains using crt.sh',
  async execute(sock, msg, args) {
    const domain = args[0];
    if (!domain) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .subdomain <domain>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔎 Finding subdomains for ${domain}...`, mentions: [jid] });
      const res = await axios.get(`https://crt.sh/?q=%25.${domain}&output=json`, { httpsAgent: agent });
      let subdomains = [];
      res.data.forEach(entry => {
        const name = entry.name_value;
        if (name && name.includes(domain)) {
          const parts = name.split(/\r?\n/);
          parts.forEach(p => { if (p.endsWith(domain) && !subdomains.includes(p)) subdomains.push(p); });
        }
      });
      subdomains = subdomains.slice(0, 30);
      let text = `🌐 Subdomains found for ${domain}:\n`;
      text += subdomains.join('\n') || 'None found';
      const output = `🛡️ *Subdomain Enumeration*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${domain}\n\n${text.slice(0, 1700)}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output, mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Subdomain scan failed: ${err.message}` });
    }
  }
};
