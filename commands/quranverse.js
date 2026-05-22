const axios = require('axios');

module.exports = {
  name: 'quranverse',
  category: 'religion',
  description: 'Get a Quran verse by surah and ayah number (e.g., .quranverse 2 255)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const surah = args[0];
    const ayah = args[1];
    if (!surah || !ayah) return sock.sendMessage(from, { text: '❌ Usage: .quranverse <surah> <ayah>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/quran/verse?surah=${surah}&ayah=${ayah}`);
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: `❌ Verse not found.` }, { quoted: msg });

      const text = `📖 *${data.reference}* (${data.surah.englishName})\n\n` +
        `🇸🇦 *Arabic:* ${data.arabic}\n\n` +
        `🇬🇧 *Translation (${data.translator}):* ${data.translation}`;

      let audioBuffer = null;
      if (data.audio) {
        try {
          const audioRes = await axios.get(data.audio, { responseType: 'arraybuffer', timeout: 15000 });
          audioBuffer = Buffer.from(audioRes.data);
        } catch (audioErr) {}
      }

      await sock.sendMessage(from, { text }, { quoted: msg });
      if (audioBuffer) {
        await sock.sendMessage(from, { audio: audioBuffer, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error. Check surah/ayah numbers.' }, { quoted: msg });
    }
  }
};
