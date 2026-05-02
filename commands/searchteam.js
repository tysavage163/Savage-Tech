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
  name: 'searchteam',
  category: 'sports',
  description: 'Search team by name (sends badge)',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .searchteam <team name>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching for team "${query}"...`, mentions: [jid] });
      const res = await axios.get(`https://apis.xwolf.space/api/sports/search/team?q=${encodeURIComponent(query)}`, { httpsAgent: agent });
      if (!res.data.success || !res.data.result) throw new Error('No results');
      const t = res.data.result;
      let caption = `🏆 *Team: ${t.name}*\n👤 REQUESTED BY: @${sender}\n\n`;
      caption += `🏷️ ID: ${t.id}\n⚽ Sport: ${t.sport}\n🏅 League: ${t.league}\n🌍 Country: ${t.country}\n🏟️ Stadium: ${t.stadium || 'N/A'}\n📝 ${(t.description || '').slice(0, 200)}\n┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼`;
      let imgUrl = t.badge || t.thumbnail;
      if (imgUrl && imgUrl.startsWith('http')) {
        const imgBuffer = await downloadFile(imgUrl);
        await sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: caption, mentions: [jid] });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: caption, mentions: [jid] });
      }
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Team not found: ${err.message}` });
    }
  }
};
