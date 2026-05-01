const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'geoip',
  category: 'ethical hacking',
  description: 'IP geolocation lookup',
  async execute(sock, msg, args) {
    const ip = args[0];
    if (!ip) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .geoip <IP>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: `🌍 Locating IP ${ip}...`, mentions: [jid] });
      const res = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,isp,org,as`, { httpsAgent: agent });
      if (res.data.status === 'fail') throw new Error(res.data.message);
      const d = res.data;
      let text = `📍 Geolocation for ${ip}\n`;
      text += `Country: ${d.country}\nRegion: ${d.regionName}\nCity: ${d.city}\n`;
      text += `ZIP: ${d.zip}\nCoordinates: ${d.lat}, ${d.lon}\nISP: ${d.isp}\nOrganization: ${d.org}\nAS: ${d.as}`;
      const output = `🛡️ *GeoIP Lookup*\n👤 REQUESTED BY: @${sender}\n🎯 Target: ${ip}\n\n${text}\n\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { text: output.slice(0, 2000), mentions: [jid] });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ GeoIP error: ${err.message}` });
    }
  }
};
