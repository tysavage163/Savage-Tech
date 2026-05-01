const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'headers',
  category: 'ethical hacking',
  description: 'Fetch HTTP response headers',
  async execute(sock, msg, args) {
    let url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .headers <url>' });
    if (!url.startsWith('http')) url = 'https://' + url;
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `📡 Fetching headers from ${url}...`, mentions: [jid] });
      const res = await axios.head(url, { httpsAgent: agent, timeout: 10000 });
      let text = `📋 Headers for ${url}\n`;
      for (const [key, value] of Object.entries(res.headers)) {
        text += `${key}: ${value}\n`;
      }
      const output = `🛡️ *HTTP Headers*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${url}\n\n${text.slice(0, 1800)}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output, mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Headers fetch failed: ${err.message}` });
    }
  }
};
