const axios = require('axios');

module.exports = {
  name: 'cocktailbyingredient',
  category: 'food',
  description: 'Find cocktails that use a specific ingredient (e.g., .cocktailbyingredient lime)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const ingredient = args.join(' ');
    if (!ingredient) return sock.sendMessage(from, { text: '❌ Usage: .cocktailbyingredient <ingredient>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/food/cocktail/by-ingredient?ingredient=${encodeURIComponent(ingredient)}`);
      const data = res.data;
      if (!data.success || !data.drinks || data.drinks.length === 0) {
        return sock.sendMessage(from, { text: `❌ No cocktails found with ingredient "${ingredient}".` }, { quoted: msg });
      }

      const drinks = data.drinks.slice(0, 10);
      let text = `🍸 *COCKTAILS WITH ${ingredient.toUpperCase()}*\n\n`;
      for (const d of drinks) {
        const name = d.strDrink || d.name;
        text += `🔹 ${name}\n`;
      }

      let imageBuffer = null;
      const firstDrink = drinks[0];
      const imageUrl = firstDrink.strDrinkThumb || firstDrink.image;
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
      await sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
    }
  }
};
