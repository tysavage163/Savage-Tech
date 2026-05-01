const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'wiki',
  category: 'search menu',
  description: 'Search Wikipedia – shows full text',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .wiki <term>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching Wikipedia for "${query}" @${sender}...`, mentions: [jid] });
      const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(query)}`;
      const res = await axios.get(url, { httpsAgent: agent, headers: { 'User-Agent': 'Savage-Bot' } });
      const page = Object.values(res.data.query.pages)[0];
      if (!page || page.missing) throw new Error('Not found');
      let extract = page.extract || '';
      let result = '';
      if (!extract || extract.length < 100) {
        // fetch disambiguation links
        const linksUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=links&pllimit=20&titles=${encodeURIComponent(query)}`;
        const linksRes = await axios.get(linksUrl, { httpsAgent: agent, headers: { 'User-Agent': 'Savage-Bot' } });
        const linkPage = Object.values(linksRes.data.query.pages)[0];
        const titles = (linkPage.links || []).map(l => l.title).filter(t => !t.includes('(disambiguation)')).slice(0, 12);
        if (titles.length) {
          result = `📖 *WIKIPEDIA: ${page.title} (disambiguation)*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\nPossible meanings:\n${titles.map((t, i) => `${i+1}. ${t}`).join('\n')}`;
        } else {
          result = `📖 *WIKIPEDIA: ${page.title}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\nNo extract available.\n🔗 https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`;
        }
      } else {
        if (extract.length > 1600) extract = extract.slice(0, 1600) + '…';
        result = `📖 *WIKIPEDIA: ${page.title}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n${extract}\n🔗 ${page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`}`;
      }
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Wiki error: ${err.message}` });
    }
  }
};
