const axios = require('axios');

module.exports = {
  name: 'cocktailsearch',
  category: 'food',
  description: 'Search cocktails/drinks by name (returns ingredients, glass type, instructions)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: '❌ Usage: .cocktailsearch <name>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/food/cocktail/search?name=${encodeURIComponent(query)}`);
      const data = res.data;
      if (!data.success || !data.drinks || data.drinks.length === 0) {
        return sock.sendMessage(from, { text: `❌ No cocktails found for "${query}".` }, { quoted: msg });
      }

      const drink = data.drinks[0];
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
      const imageUrl = drink.strDrinkThumb;
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
