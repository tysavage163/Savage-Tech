const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'mac',
  category: 'ethical hacking',
  description: 'Lookup MAC address vendor',
  async execute(sock, msg, args) {
    const mac = args[0];
    if (!mac) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .mac <MAC address>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Looking up MAC ${mac}...`, mentions: [jid] });
      const res = await axios.get(`https://api.maclookup.app/v2/macs/${mac}`, { httpsAgent: agent });
      if (!res.data.success) throw new Error(res.data.error || 'Not found');
      let text = `🏷️ Vendor: ${res.data.company}\n`;
      text += `Block start: ${res.data.blockStart}\nBlock end: ${res.data.blockEnd}\nMAC range: ${res.data.blockRange}`;
      const output = `🛡️ *MAC Vendor Lookup*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${mac}\n\n${text}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output, mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ MAC lookup failed: ${err.message}` });
    }
  }
};
