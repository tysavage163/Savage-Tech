const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'weather',
  category: 'tools',
  description: 'Get current weather for a city',
  async execute(sock, msg, args) {
    const city = args.join(' ');
    if (!city) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .weather <city_name>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const res = await axios.get(`https://apis.xwolf.space/api/tools/weather?city=${encodeURIComponent(city)}`, { httpsAgent: agent });
      const result = res.data.result || res.data.weather || 'No result';
      await sock.sendMessage(msg.key.remoteJid, { text: `🌤️ *Weather in ${city} for @${sender}*\n\n${result.slice(0, 1900)}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
    } catch (err) { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` }); }
  }
};
