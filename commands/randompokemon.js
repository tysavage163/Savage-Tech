const axios = require('axios');

module.exports = {
  name: 'randompokemon',
  category: 'fun',
  description: 'Get a random Pokemon with full stats and artwork',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/pokemon/random');
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: '❌ Could not fetch random Pokemon.' });

      const types = data.types?.join(', ') || 'N/A';
      const abilities = data.abilities?.map(a => a.name).join(', ') || 'N/A';
      const stats = data.stats || {};
      const text = `🎲 *RANDOM POKEMON*\n\n` +
        `*Name:* ${data.name}\n` +
        `*ID:* #${data.id}\n` +
        `*Type:* ${types}\n` +
        `*Height:* ${data.height_m} m\n` +
        `*Weight:* ${data.weight_kg} kg\n` +
        `*Abilities:* ${abilities}\n` +
        `*Stats:*\n` +
        `  ❤️ HP: ${stats.hp || '?'}\n` +
        `  ⚔️ Attack: ${stats.attack || '?'}\n` +
        `  🛡️ Defense: ${stats.defense || '?'}\n` +
        `  ✨ Sp. Attack: ${stats.special_attack || '?'}\n` +
        `  🪄 Sp. Defense: ${stats.special_defense || '?'}\n` +
        `  💨 Speed: ${stats.speed || '?'}`;

      let imageBuffer = null;
      if (data.image) {
        try {
          const imgRes = await axios.get(data.image, { responseType: 'arraybuffer', timeout: 10000 });
          imageBuffer = Buffer.from(imgRes.data);
        } catch (e) {}
      }
      if (imageBuffer) {
        await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' });
    }
  }
};
