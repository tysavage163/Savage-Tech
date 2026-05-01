const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'bible',
  category: 'tools',
  description: 'Lookup Bible verse',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .bible <verse> (e.g., John 3:16)' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/bible?verse=${encodeURIComponent(query)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.verse || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `📖 *Bible Verse for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
