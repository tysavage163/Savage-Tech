const axios = require('axios');

module.exports = {
  name: 'cocktailsearch',
  category: 'food',
  description: 'Search cocktails/drinks by name (returns ingredients, glass type, instructions)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❌ Usage: .cocktailsearch <name> (e.g., .cocktailsearch margarita)' }, { quoted: msg });

    let drink = null;
    let imageUrl = null;

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/food/cocktail/search?name=${encodeURIComponent(query)}`);
      const data = res.data;
      if (data.success && data.drinks && data.drinks.length) {
        drink = data.drinks[0];
        imageUrl = drink.strDrinkThumb;
      } else if (data.success && data.result && data.result.length) {
        drink = data.result[0];
        imageUrl = drink.strDrinkThumb || drink.image;
      } else {
        throw new Error('No drink found');
      }
    } catch (err) {
      try {
        const fallbackRes = await axios.get(`https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`);
        if (fallbackRes.data.drinks && fallbackRes.data.drinks.length) {
          drink = fallbackRes.data.drinks[0];
          imageUrl = drink.strDrinkThumb;
        } else {
          return sock.sendMessage(from, { text: `❌ No cocktails found for "${query}".` }, { quoted: msg });
        }
      } catch (fallbackErr) {
        return sock.sendMessage(from, { text: '❌ API error.' }, { quoted: msg });
      }
    }

    if (!drink) {
      return sock.sendMessage(from, { text: `❌ No cocktails found for "${query}".` }, { quoted: msg });
    }

    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ing = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];
      if (ing && ing.trim() !== '') {
        ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ing.trim()}`);
      } else break;
    }

    const text = `🍹 *${drink.strDrink}*\n\n` +
      `📋 *Glass:* ${drink.strGlass || 'N/A'}\n` +
      `🧪 *Ingredients:*\n${ingredients.map(i => `  • ${i}`).join('\n')}\n\n` +
      `📝 *Instructions:* ${drink.strInstructions || 'N/A'}`;

    let imageBuffer = null;
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
