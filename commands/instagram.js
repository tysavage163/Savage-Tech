const axios = require('axios');

module.exports = {
  name: 'instagram',
  category: 'download',
  description: 'Download Instagram media',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .instagram <URL>' });
    
    try {
      const res = await axios.get(`https://api.ryzendesu.vip/api/downloader/ig?url=${encodeURIComponent(url)}`);
      const data = res.data;
      if (data.url) {
        // If it's a video
        await sock.sendMessage(msg.key.remoteJid, { video: { url: data.url }, caption: '📸 Instagram download' });
      } else if (data.images && data.images.length) {
        // If it's a carousel (multiple images) – send first one or loop
        await sock.sendMessage(msg.key.remoteJid, { image: { url: data.images[0] }, caption: '📸 Instagram image' });
      } else {
        throw new Error('No media found');
      }
    } catch (err) {
      console.error(err);
      sock.sendMessage(msg.key.remoteJid, { text: '❌ Download failed. Instagram might be blocking the API.' });
    }
  }
};
