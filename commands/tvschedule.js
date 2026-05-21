const axios = require('axios');

module.exports = {
  name: 'tvschedule',
  category: 'media',
  description: "Get today's TV broadcast schedule for any country (e.g., US, GB, DE)",
  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    const country = args[0] ? args[0].toUpperCase() : 'US';
    try {
      const res = await axios.get(`https://api.tvmaze.com/schedule?country=${country}`);
      const shows = res.data.slice(0, 10);
      if (!shows.length) return sock.sendMessage(from, { text: `❌ No schedule found for ${country} today.` });
      let text = `📺 *TODAY'S TV SCHEDULE (${country})*\n\n`;
      for (const s of shows) {
        const time = s.airtime || '??:??';
        const name = s.show.name;
        const network = s.show.network?.name || s.show.webChannel?.name || 'N/A';
        text += `⏰ ${time} – *${name}*\n   📺 ${network}\n\n`;
      }
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Schedule fetch failed. Check country code (US, GB, DE, etc.).' });
    }
  }
};
