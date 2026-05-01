const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'smug',
  category: 'anime',
  description: 'Random smug anime',
  async execute(sock, msg, args) {
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎴 Fetching random smug anime...', mentions: [jid] });
      const res = await axios.get('https://nekos.best/api/v2/smug', { httpsAgent: agent });
      const imgUrl = res.data.results[0].url;
      const caption = '🎀 *Anime smug*\n👤 REQUESTED BY: @' + sender + '\n🚀 POWERED BY SAVAGE-CORE';
      await sock.sendMessage(msg.key.remoteJid, { image: { url: imgUrl }, caption: caption, mentions: [jid] });
    } catch (err) {
      console.error('smug error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to fetch anime smug.' });
    }
  }
};
