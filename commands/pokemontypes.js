const axios = require('axios');

module.exports = {
  name: 'pokemontypes',
  category: 'fun',
  description: 'List all 18 Pokemon types',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/pokemon/types');
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: '❌ Could not fetch Pokemon types.' });
      const types = data.types || [];
      let text = '🔖 *POKEMON TYPES*\n\n';
      for (const t of types) {
        text += `🔹 ${t}\n`;
      }
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' });
    }
  }
};
