const axios = require('axios');

module.exports = {
  name: 'mealbyingredient',
  category: 'food',
  description: 'Find meals that use a specific ingredient (e.g., chicken, beef, tomato)',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const ingredient = args.join(' ').toLowerCase();
    if (!ingredient) return sock.sendMessage(from, { text: '❌ Usage: .mealbyingredient <ingredient>' }, { quoted: msg });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/food/meal/by-ingredient?ingredient=${encodeURIComponent(ingredient)}`);
      const data = res.data;
      if (!data.success || !data.meals || data.meals.length === 0) {
        return sock.sendMessage(from, { text: `❌ No meals found with ingredient "${ingredient}".` }, { quoted: msg });
      }

      const meals = data.meals.slice(0, 10);
      let text = `🍽️ *MEALS WITH ${ingredient.toUpperCase()}*\n\n`;
      for (const meal of meals) {
        const name = meal.strMeal || meal.name;
        text += `🔹 ${name}\n`;
      }

      let imageBuffer = null;
      const firstMeal = meals[0];
      const imageUrl = firstMeal.strMealThumb || firstMeal.image;
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
