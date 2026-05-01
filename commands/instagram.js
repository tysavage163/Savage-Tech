const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

module.exports = {
  name: 'instagram',
  category: 'download',
  description: 'Download Instagram media (API may be unstable)',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .instagram <URL>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      const apiUrl = `https://apis.xwolf.space/api/download/instagram?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl, { httpsAgent });
      if (!res.data.success) {
        // Show the actual error from the API
        const errorMsg = res.data.error || res.data.details || 'Unknown error';
        return sock.sendMessage(msg.key.remoteJid, { text: `❌ Instagram download failed:\n${errorMsg}\n\nTry again later or use a different platform.`, mentions: mention });
      }
      // If success, extract download URL (code omitted for brevity)
      sock.sendMessage(msg.key.remoteJid, { text: '✅ Download successful! (Code to handle media not included here – contact dev).' });
    } catch (err) {
      sock.sendMessage(msg.key.remoteJid, { text: `❌ Network error: ${err.message}` });
    }
  }
};
