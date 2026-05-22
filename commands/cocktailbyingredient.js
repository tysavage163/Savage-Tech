const axios = require('axios');

module.exports = {
  name: 'cocktailbyingredient',
  category: 'food',
  description: 'Find cocktails that use a specific ingredient',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const ingredient = args.join(' ');
    if (!ingredient) return sock.sendMessage(from, { text: '❌ Usage: .cocktailbyingredient <ingredient>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
      const data = res.data;
      if (!data.drinks || data.drinks.length === 0) {
        return sock.sendMessage(from, { text: `❌ No cocktails found with ingredient "${ingredient}".` }, { quoted: msg });
      }

      // Log first drink to console (if you can access later)
      console.log('First drink sample:', JSON.stringify(data.drinks[0]));

      // Try multiple possible field names
      const drinks = data.drinks.slice(0, 10);
      let text = `🍸 *COCKTAILS WITH ${ingredient.toUpperCase()}*\n\n`;
      for (const d of drinks) {
        let name = d.strDrink || d.name || d.drink || 'Unknown';
        text += `🔹 ${name}\n`;
      }

      // Also send the raw first item as a message to debug (remove after fixing)
      const sample = drinks[0];
      const sampleText = `DEBUG: First drink keys: ${Object.keys(sample).join(', ')}`;
      await sock.sendMessage(from, { text: sampleText }, { quoted: msg });

      let imageBuffer = null;
      const firstDrink = drinks[0];
      const imageUrl = firstDrink.strDrinkThumb || firstDrink.image || firstDrink.thumb;
      if (imageUrl) {
        try {
          const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
          imageBuffer = Buffer.from(imgRes.data);
        } catch (err) {}
      }

      if (imageBuffer) {
        await sock.sendMessage(from, { image: imageBuffer, caption: text }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text }, { quoted: msg });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: `❌ API error: ${err.message}` }, { quoted: msg });
    }
  }
};
