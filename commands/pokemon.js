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
      console.log('Full API response:', JSON.stringify(res.data, null, 2));
      
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: `❌ Pokemon "${name}" not found.` });

      // Try different possible data structures
      const p = data.data || data.result || data;
      
      const text = `⚡ *POKEMON INFO*\n\n` +
        `*Name:* ${p.name || p.pokemon_name || '?'}\n` +
        `*ID:* ${p.id || p.pokedex_number || '?'}\n` +
        `*Type:* ${Array.isArray(p.types) ? p.types.join(', ') : (p.type || 'N/A')}\n` +
        `*Height:* ${p.height ? p.height / 10 : (p.height_m || '?')} m\n` +
        `*Weight:* ${p.weight ? p.weight / 10 : (p.weight_kg || '?')} kg\n` +
        `*Abilities:* ${Array.isArray(p.abilities) ? p.abilities.join(', ') : (p.ability || 'N/A')}\n` +
        `*Stats:*\n` +
        `  ❤️ HP: ${p.hp || p.stats?.hp || '?'}\n` +
        `  ⚔️ Attack: ${p.attack || p.stats?.attack || '?'}\n` +
        `  🛡️ Defense: ${p.defense || p.stats?.defense || '?'}\n` +
        `  ✨ Sp. Attack: ${p.special_attack || p.stats?.special_attack || '?'}\n` +
        `  🪄 Sp. Defense: ${p.special_defense || p.stats?.special_defense || '?'}\n` +
        `  💨 Speed: ${p.speed || p.stats?.speed || '?'}`;

      let imageBuffer = null;
      const imageUrl = p.image || p.sprite || p.artwork;
      if (imageUrl) {
        try {
          const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 10000 });
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
