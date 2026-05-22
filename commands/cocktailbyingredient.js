const axios = require('axios');

module.exports = {
  name: 'cocktailbyingredient',
  category: 'food',
  description: 'Find cocktails that use a specific ingredient (e.g., .cocktailbyingredient lime)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const ingredient = args.join(' ');
    if (!ingredient) return sock.sendMessage(from, { text: '❌ Usage: .cocktailbyingredient <ingredient>' }, { quoted: msg });

    let drinks = [];

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/food/cocktail/by-ingredient?ingredient=${encodeURIComponent(ingredient)}`);
      const data = res.data;
      if (data.success && data.drinks && data.drinks.length) {
        drinks = data.drinks;
      } else if (data.success && data.result && data.result.length) {
        drinks = data.result;
      } else {
        throw new Error('No drinks from WolfAPIs');
      }
    } catch (err) {
      try {
        const fallbackRes = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`);
        if (fallbackRes.data.drinks && fallbackRes.data.drinks.length) {
          drinks = fallbackRes.data.drinks;
        } else {
          return sock.sendMessage(from, { text: `❌ No cocktails found with ingredient "${ingredient}".` }, { quoted: msg });
        }
      } catch (fallbackErr) {
        return sock.sendMessage(from, { text: `❌ API error. Could not fetch cocktails with "${ingredient}".` }, { quoted: msg });
      }
    }

    if (!drinks || drinks.length === 0) {
      return sock.sendMessage(from, { text: `❌ No cocktails found with ingredient "${ingredient}".` }, { quoted: msg });
    }

    const displayDrinks = drinks.slice(0, 10);
    let text = `🍸 *COCKTAILS WITH ${ingredient.toUpperCase()}*\n\n`;
    for (const d of displayDrinks) {
      const name = d.strDrink || d.name;
      text += `🔹 ${name}\n`;
    }

    let imageBuffer = null;
    const firstDrink = displayDrinks[0];
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
  }
};
