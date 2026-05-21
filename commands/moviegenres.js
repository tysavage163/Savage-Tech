const axios = require('axios');

module.exports = {
  name: 'moviegenres',
  category: 'media',
  description: 'List all TMDb movie genre IDs and names',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/movie/genres');
      const data = res.data;
      if (data.success && data.genres) {
        let text = '🎬 *MOVIE GENRES (TMDb)*\n\n';
        for (const g of data.genres) {
          text += `🔹 *${g.name}* – ID: ${g.id}\n`;
        }
        await sock.sendMessage(from, { text });
      } else {
        await sock.sendMessage(from, { text: `❌ Failed: ${data.error || 'Unknown error'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or API unavailable.' });
    }
  }
};
