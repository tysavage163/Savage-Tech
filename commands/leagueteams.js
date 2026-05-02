const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function formatResult(data) {
  if (!data.success) return "❌ Error: " + (data.error || 'Unknown');
  if (!data.result) return "No data found.";
  if (Array.isArray(data.result) && data.result.length) {
    let str = `Found ${data.result.length} items:\n`;
    data.result.slice(0, 10).forEach((item, i) => {
      str += `${i+1}. ${item.name || item.title || item.event || 'Item'}\n`;
    });
    return str;
  }
  if (typeof data.result === 'object') return JSON.stringify(data.result, null, 2).slice(0, 1500);
  return data.result;
}

module.exports = {
  name: 'leagueteams',
  category: 'sports',
  description: 'Get sports data (leagueteams)',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .leagueteams <query>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🏆 Fetching leagueteams...`, mentions: [jid] });
      const apiUrl = `https://apis.xwolf.space/api/sports/league/teams?q=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { httpsAgent: agent });
      const result = formatResult(res.data);
      const output = `🏅 *Sports: leagueteams*\n👤 REQUESTED BY: @${sender}\n🔍 Query: ${query}\n\n${result}\n\n┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼`;
      await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
    }
  }
};
