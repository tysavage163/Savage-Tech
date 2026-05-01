const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'testdl',
  category: 'debug',
  description: 'Test download API response',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: 'Usage: .testdl <URL>' });
    try {
      // Try to detect platform from URL (instagram, facebook, etc.)
      let platform = 'instagram';
      if (url.includes('facebook.com')) platform = 'facebook';
      else if (url.includes('tiktok.com')) platform = 'tiktok';
      else if (url.includes('twitter.com') || url.includes('x.com')) platform = 'twitter';
      else if (url.includes('youtube.com') || url.includes('youtu.be')) platform = 'youtube';
      else if (url.includes('snapchat.com')) platform = 'snapchat';
      const apiUrl = `https://apis.xwolf.space/api/download/${platform}?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent });
      let text = `Platform: ${platform}\nResponse:\n${JSON.stringify(response.data, null, 2)}`;
      if (text.length > 2000) text = text.slice(0, 2000) + '...';
      await sock.sendMessage(msg.key.remoteJid, { text: text });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `Error: ${err.message}` });
    }
  }
};
