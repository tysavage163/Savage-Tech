const axios = require('axios');

module.exports = {
  name: 'instagram',
  category: 'download',
  description: 'Download Instagram media',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .instagram <URL>' });

    const apis = [
      `https://apis.xwolf.space/api/download/instagram?url=${encodeURIComponent(url)}`,
      `https://api.ryzendesu.vip/api/downloader/ig?url=${encodeURIComponent(url)}`,
      `https://instasave.xyz/api?url=${encodeURIComponent(url)}`
    ];

    for (const api of apis) {
      try {
        const res = await axios.get(api);
        let mediaUrl = null;
        if (res.data.success && res.data.url) mediaUrl = res.data.url;
        else if (res.data.url) mediaUrl = res.data.url;
        else if (res.data.result && res.data.result.url) mediaUrl = res.data.result.url;
        else if (res.data.media) mediaUrl = res.data.media;
        
        if (mediaUrl) {
          await sock.sendMessage(msg.key.remoteJid, { video: { url: mediaUrl }, caption: '📸 Downloaded from Instagram' });
          return;
        }
      } catch (err) {
        console.log(`API failed: ${api}`, err.message);
      }
    }
    sock.sendMessage(msg.key.remoteJid, { text: '❌ All download APIs failed. Instagram may be blocking them. Try again later or use a different platform.' });
  }
};
