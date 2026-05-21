const axios = require('axios');

module.exports = {
  name: 'pokemonbytype',
  category: 'fun',
  description: 'Get Pokemon belonging to a specific type (e.g., .pokemonbytype fire)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const type = args[0]?.toLowerCase();
    if (!type) return sock.sendMessage(from, { text: '❌ Usage: .pokemonbytype <type> (e.g., .pokemonbytype water)' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/pokemon/by-type?type=${encodeURIComponent(type)}`);
      const data = res.data;
      if (!data.success || !data.pokemon) return sock.sendMessage(from, { text: `❌ Type "${type}" not found or no Pokemon.` });
      const pokemonList = data.pokemon.slice(0, 20);
      let text = `🔥 *POKEMON OF TYPE: ${type.toUpperCase()}*\n\n`;
      for (const p of pokemonList) {
        text += `🔹 ${p}\n`;
      }
      if (data.pokemon.length > 20) text += `\n⚠️ Showing first 20 of ${data.pokemon.length}.`;
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' });
    }
  }
};
