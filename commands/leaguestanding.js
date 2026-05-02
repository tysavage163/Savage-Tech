const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'leaguestanding',
  category: 'sports',
  description: 'Get league standings table',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .leaguestanding <league name>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `📊 Fetching standings for "${query}"...`, mentions: [jid] });
      const res = await axios.get(`https://apis.xwolf.space/api/sports/league/table?q=${encodeURIComponent(query)}`, { httpsAgent: agent });
      if (!res.data.success || !res.data.result) throw new Error('No table');
      const teams = res.data.result;
      let text = `🏆 *Standings: ${query}*\n👤 REQUESTED BY: @${sender}\n\n`;
      if (Array.isArray(teams)) {
        text += `# | Team                | P | W | D | L | GF | GA | Pts\n`;
        teams.slice(0, 20).forEach((t, i) => {
          text += `${i+1} | ${(t.name || '').padEnd(20)} | ${t.played || 0} | ${t.win || 0} | ${t.draw || 0} | ${t.loss || 0} | ${t.goalsFor || 0} | ${t.goalsAgainst || 0} | ${t.points || 0}\n`;
        });
      } else {
        text += JSON.stringify(teams, null, 2);
      }
      text += `\n┍━━━━━━━━━━━━━━━╼
┃ 🚀 SΛVΛGΞ-TΞCH OS
┕━━━━━━━━━━━━━━━╼`;
      await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Standings error: ${err.message}` });
    }
  }
};
