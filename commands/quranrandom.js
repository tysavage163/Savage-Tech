const axios = require('axios');

module.exports = {
  name: 'quranrandom',
  category: 'religion',
  description: 'Get a random Quran verse with Arabic, translation and audio',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;

    try {
      const res = await axios.get('https://apis.xwolf.space/api/quran/random');
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: `❌ Could not fetch random verse.` }, { quoted: msg });

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
      await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
    }
  }
};
