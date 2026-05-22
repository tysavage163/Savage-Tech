const axios = require('axios');

module.exports = {
  name: 'quransearch',
  category: 'religion',
  description: 'Search the Quran by keyword in English translation',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const keyword = args.join(' ');
    if (!keyword) return sock.sendMessage(from, { text: '❌ Usage: .quransearch <keyword>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/quran/search?q=${encodeURIComponent(keyword)}`);
      const data = res.data;
      if (!data.success || !data.results || data.results.length === 0) {
        return sock.sendMessage(from, { text: `❌ No results found for "${keyword}".` }, { quoted: msg });
      }

      const results = data.results.slice(0, 5);
      let text = `🔍 *Quran Search Results for "${keyword}"*\n\n`;
      for (const r of results) {
        text += `📖 *${r.reference}*\n${r.text}\n\n`;
      }

      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
    }
  }
};
