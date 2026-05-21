const axios = require('axios');

module.exports = {
  name: 'pokemon',
  category: 'fun',
  description: 'Get full Pokemon details (stats, abilities, types, artwork)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const name = args[0]?.toLowerCase();
    if (!name) return sock.sendMessage(from, { text: '❌ Usage: .pokemon <name> (e.g., .pokemon pikachu)' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/pokemon/info?name=${encodeURIComponent(name)}`);
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: `❌ Pokemon "${name}" not found.` });

      const p = data.data;
      const types = p.types?.join(', ') || 'N/A';
      const abilities = p.abilities?.join(', ') || 'N/A';
      const stats = p.stats || {};
      const text = `⚡ *POKEMON INFO*\n\n` +
        `*Name:* ${p.name}\n` +
        `*ID:* #${p.id}\n` +
        `*Type:* ${types}\n` +
        `*Height:* ${p.height / 10} m\n` +
        `*Weight:* ${p.weight / 10} kg\n` +
        `*Abilities:* ${abilities}\n` +
        `*Stats:*\n` +
        `  ❤️ HP: ${stats.hp || '?'}\n` +
        `  ⚔️ Attack: ${stats.attack || '?'}\n` +
        `  🛡️ Defense: ${stats.defense || '?'}\n` +
        `  ✨ Special Attack: ${stats.specialAttack || '?'}\n` +
        `  🪄 Special Defense: ${stats.specialDefense || '?'}\n` +
        `  💨 Speed: ${stats.speed || '?'}`;

      let imageBuffer = null;
      if (p.image) {
        try {
          const imgRes = await axios.get(p.image, { responseType: 'arraybuffer', timeout: 10000 });
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
