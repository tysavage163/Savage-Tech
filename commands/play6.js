const axios = require('axios');

module.exports = {
  name: 'play6',
  category: 'audio',
  description: 'Convert YouTube to MP4',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play6 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `📹 *Savage-Tech is converting to MP4 for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/ytmp4?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const downloadUrl = res.data.downloadUrl || res.data.result;
        await sock.sendMessage(msg.key.remoteJid, { text: `📹 *MP4 Ready:*\n${downloadUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ ytmp4 error.' });
    }
  }
};
