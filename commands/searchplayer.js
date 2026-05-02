const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'searchplayer',
  category: 'sports',
  description: 'Search player by name (sends image)',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .searchplayer <player name>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching for "${query}"...`, mentions: [jid] });
      const res = await axios.get(`https://apis.xwolf.space/api/sports/search/player?q=${encodeURIComponent(query)}`, { httpsAgent: agent });
      if (!res.data.success || !res.data.result) throw new Error('No results');
      const p = res.data.result;
      let caption = `⚽ *Player: ${p.name}*\n👤 REQUESTED BY: @${sender}\n\n`;
      caption += `🏷️ ID: ${p.id}\n🎯 Sport: ${p.sport}\n📋 Team: ${p.team}\n🌍 Nationality: ${p.nationality}\n📍 Position: ${p.position}\n🎂 Born: ${p.dateBorn}\n┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼`;
      // If cutout image exists, use it; otherwise fallback to thumbnail
      let imgUrl = p.cutout || p.thumbnail;
      if (imgUrl && imgUrl.startsWith('http')) {
        const imgBuffer = await downloadFile(imgUrl);
        await sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: caption, mentions: [jid] });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: caption, mentions: [jid] });
      }
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Player not found: ${err.message}` });
    }
  }
};
