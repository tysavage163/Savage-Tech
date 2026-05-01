const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'latency',
  category: 'ethical hacking',
  description: 'Measure HTTP latency (same as .ping)',
  async execute(sock, msg, args) {
    let target = args[0];
    if (!target) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .latency <domain>' });
    if (!target.startsWith('http')) target = 'https://' + target;
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `⏱️ Measuring latency to ${target}...`, mentions: [jid] });
      const start = Date.now();
      await axios.get(target, { httpsAgent: agent, timeout: 10000 });
      const latency = Date.now() - start;
      const output = `🛡️ *Latency Result*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${target}\n\n✅ Latency: ${latency} ms\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output, mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Latency check failed: ${err.message}` });
    }
  }
};
