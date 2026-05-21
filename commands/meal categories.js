const axios = require('axios');

module.exports = {
  name: 'mealcategories',
  category: 'food',
  description: 'List all meal categories (beef, chicken, dessert, etc.)',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/food/meal/categories');
      const data = res.data;
      if (!data.success) return sock.sendMessage(from, { text: '❌ Failed to fetch meal categories.' });
      const categories = data.categories || [];
      let text = '🍽️ *MEAL CATEGORIES*\n\n';
      for (const cat of categories) {
        text += `🔹 ${cat}\n`;
      }
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ API error.' });
    }
  }
};
