const axios = require('axios');

module.exports = {
  name: 'play11',
  category: 'audio',
  description: 'Download YouTube video in HD quality',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play11 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `📺 *Savage-Tech is fetching HD video for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/hd?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const hdUrl = res.data.downloadUrl || res.data.result;
        await sock.sendMessage(msg.key.remoteJid, { text: `📺 *HD Video Ready:*\n${hdUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ HD download error.' });
    }
  }
};
