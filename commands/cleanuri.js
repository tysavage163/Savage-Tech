const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

function extractShortUrl(obj) {
  if (!obj) return null;
  if (typeof obj === 'string') return obj;
  if (obj.shortUrl) return obj.shortUrl;
  if (obj.url) return obj.url;
  if (obj.result) return extractShortUrl(obj.result);
  if (obj.data) return extractShortUrl(obj.data);
  return null;
}

module.exports = {
  name: 'cleanuri',
  category: 'tools',
  description: 'Shorten URL with CleanURI',
  async execute(sock, msg, args) {
    const longUrl = args[0];
    if (!longUrl || !longUrl.startsWith('http')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .cleanuri <https://example.com/long/url>' });
    }
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    try {
      const apiUrl = `https://apis.xwolf.space/api/short/cleanuri?url=${encodeURIComponent(longUrl)}`;
      const res = await axios.get(apiUrl, { httpsAgent: agent });
      let short = null;
      if (res.data.success) short = extractShortUrl(res.data);
      if (!short) short = res.data.error || 'Shortening failed';
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🔗 *CleanURI for @${senderName}*\n\n${short}\n\n🚀 POWERED BY SAVAGE-CORE`,
        mentions: mention
      });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
    }
  }
};
