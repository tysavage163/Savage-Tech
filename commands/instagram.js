const axios = require('axios');

module.exports = {
  name: 'instagram',
  category: 'download',
  description: 'Download Instagram media',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .instagram <URL>' });
    
    try {
      const apiUrl = `https://apis.xwolf.space/api/download/instagram?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      console.log('Full API response:', JSON.stringify(res.data, null, 2)); // LOG IT
      
      if (!res.data.success) {
        return sock.sendMessage(msg.key.remoteJid, { text: `❌ API error: ${res.data.error || res.data.message || 'Unknown'}` });
      }
      
      // If success, extract media URL(s) and send
      const mediaUrl = res.data.url || res.data.video || res.data.media;
      if (!mediaUrl) {
        return sock.sendMessage(msg.key.remoteJid, { text: '❌ No media URL found in API response.' });
      }
      
      await sock.sendMessage(msg.key.remoteJid, { video: { url: mediaUrl }, caption: '📸 Downloaded from Instagram' });
      
    } catch (err) {
      console.error(err);
      sock.sendMessage(msg.key.remoteJid, { text: `❌ Network error: ${err.message}` });
    }
  }
};
