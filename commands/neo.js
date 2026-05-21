const axios = require('axios');

module.exports = {
  name: 'neo',
  category: 'search menu',
  description: 'Near Earth Objects – today\'s asteroids approaching Earth',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    try {
      const res = await axios.get('https://apis.xwolf.space/api/nasa/neo');
      const data = res.data;
      if (!data.success || !data.neo) return sock.sendMessage(from, { text: '❌ No NEO data available.' });
      const neos = data.neo.slice(0, 5);
      let text = '☄️ *NEAR EARTH OBJECTS (TODAY)*\n\n';
      for (const obj of neos) {
        text += `🔹 *${obj.name}*\n`;
        text += `   📏 Size: ${obj.estimated_diameter_meters_min?.toFixed(1) || '?'} - ${obj.estimated_diameter_meters_max?.toFixed(1) || '?'} m\n`;
        text += `   ⚡ Velocity: ${obj.relative_velocity_kph?.toFixed(0) || '?'} km/h\n`;
        text += `   📅 Miss Distance: ${obj.miss_distance_km?.toLocaleString() || '?'} km\n`;
        text += `   ⚠️ Hazardous: ${obj.is_potentially_hazardous_asteroid ? 'YES' : 'NO'}\n\n`;
      }
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(from, { text: '❌ Failed to fetch asteroid data.' });
    }
  }
};
