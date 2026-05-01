const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'testaudio',
  category: 'debug',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: 'Need URL' });
    try {
      const apiUrl = `https://apis.xwolf.space/api/audio/bass?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl, { httpsAgent: agent, responseType: 'text' });
      await sock.sendMessage(msg.key.remoteJid, { text: `Content-Type: ${res.headers['content-type']}\n\nFirst 500 chars:\n${res.data.slice(0, 500)}` });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message}` });
    }
  }
};
