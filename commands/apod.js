const axios = require('axios');

module.exports = {
  name: 'apod',
  category: 'search menu',
  description: 'NASA Astronomy Picture of the Day with explanation',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/nasa/apod');
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: '❌ Failed to fetch NASA APOD.' });
      const title = data.title;
      const explanation = data.explanation.substring(0, 1000);
      const date = data.date;
      const imageUrl = data.url;
      const caption = `🌌 *NASA ASTRONOMY PICTURE OF THE DAY*\n📅 ${date}\n📷 *${title}*\n\n${explanation}...`;
      if (imageUrl) {
        const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 15000 });
        const imgBuffer = Buffer.from(imgRes.data);
        await sock.sendMessage(from, { image: imgBuffer, caption }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: caption }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or API unavailable.' });
    }
  }
};
