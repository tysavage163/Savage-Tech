const axios = require('axios');

module.exports = {
  name: 'quranverse',
  category: 'religion',
  description: 'Get a Quran verse by surah and ayah number (e.g., .quranverse 2 255)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const surah = args[0];
    const ayah = args[1];
    if (!surah || !ayah) return sock.sendMessage(from, { text: '❌ Usage: .quranverse <surah> <ayah> (e.g., .quranverse 2 255)' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/quran/verse?surah=${surah}&ayah=${ayah}`);
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: `❌ Verse not found.` }, { quoted: msg });

      const verse = data.verse;
      const text = `📖 *${data.reference}* (${data.surah.englishName})\n\n` +
        `🇸🇦 *Arabic:* ${verse.text}\n\n` +
        `🇬🇧 *Translation:* ${verse.translation}\n\n` +
        `🎧 *Audio:* ${verse.audio}`;

      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
    }
  }
};
