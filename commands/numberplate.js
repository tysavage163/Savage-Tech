const axios = require('axios');

module.exports = {
  name: 'numberplate',
  category: 'search menu',
  description: 'Lookup vehicle info by UK number plate',
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const plate = args[0];
    if (!plate) return sock.sendMessage(from, { text: '❌ Usage: .numberplate <UK plate, e.g., AB51ABC>' });

    try {
      const res = await axios.get(`https://apis.xwolf.space/api/stalk/numberplate?plate=${encodeURIComponent(plate)}`);
      const data = res.data;

      if (data.success) {
        const v = data.result;
        const caption = `🚗 *UK VEHICLE LOOKUP* 🚗\n\n` +
          `🔢 *Registration:* ${v.registration}\n` +
          `🚘 *Make:* ${v.make}\n` +
          `🏷️ *Model:* ${v.model}\n` +
          `🎨 *Colour:* ${v.colour}\n` +
          `⛽ *Fuel Type:* ${v.fuelType}\n` +
          `⚙️ *Engine Size:* ${v.engineSize}cc\n` +
          `📅 *MOT Expiry:* ${v.motExpiry || 'N/A'}\n` +
          `💰 *Tax Status:* ${v.taxStatus || 'N/A'}\n` +
          `📆 *Tax Due:* ${v.taxDueDate || 'N/A'}\n\n` +
          `🔗 *Source:* DVLA UK`;
        await sock.sendMessage(from, { text: caption }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: `❌ Number plate lookup failed: ${data.error || 'Invalid UK plate or not found'}` });
      }
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Network error or invalid number plate.' });
    }
  }
};
