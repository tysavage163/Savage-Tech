const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'wiki',
  category: 'search menu',
  description: 'Search Wikipedia articles',
  async execute(sock, msg, args) {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .wiki <search term>' });

    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🔍 Searching Wikipedia for "${query}" @${sender}...`, mentions: [jid] });
      const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro&explaintext&redirects=1&titles=${encodeURIComponent(query)}`;
      const res = await axios.get(apiUrl, { httpsAgent: agent, headers: { 'User-Agent': 'Savage-Tech-Bot/1.0' } });
      const pages = res.data.query.pages;
      const page = pages[Object.keys(pages)[0]];
      if (!page || page.missing) throw new Error('Page not found');
      let extract = page.extract || 'No description.';
      if (extract.length > 1600) extract = extract.slice(0, 1600) + '…';
      const result = `📖 *WIKIPEDIA: ${page.title}*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE\n\n${extract}\n\n🔗 https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`;
      await sock.sendMessage(msg.key.remoteJid, { text: result.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Wiki error: ${err.message}` });
    }
  }
};
