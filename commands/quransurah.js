const axios = require('axios');

module.exports = {
  name: 'quransurah',
  category: 'religion',
  description: 'Get first 20 verses of a surah by number (e.g., .quransurah 2)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const surah = args[0];
    if (!surah) return sock.sendMessage(from, { text: '❌ Usage: .quransurah <surah number>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/quran/surah?surah=${surah}`);
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: `❌ Surah not found.` }, { quoted: msg });

      const verses = data.verses.slice(0, 20);
      let text = `📖 *${data.surah.englishName} (${data.reference})* – First 20 verses\n\n`;
      for (const v of verses) {
        text += `${v.number}. ${v.arabic}\n`;
      }
      if (data.verses.length > 20) text += `\n⚠️ Showing first 20 of ${data.verses.length}.`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
    }
  }
};
