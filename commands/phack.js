const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'phack',
  category: 'ethical hacking',
  description: 'Ping a host (ethical hacking)',
  async execute(sock, msg, args) {
    let target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .ping <domain>' });
    if (!target.startsWith('http')) target = 'https://' + target;
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🏓 Pinging ${target}...`, mentions: [jid] });
      const start = Date.now();
      await axios.get(target, { httpsAgent: agent, timeout: 10000 });
      const latency = Date.now() - start;
      const output = `🛡️ *Ping Result*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${target}\n\n✅ Response time: ${latency} ms\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output, mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Ping failed: ${err.message}` });
    }
  }
};
