const axios = require('axios');

module.exports = {
  name: 'play10',
  category: 'audio',
  description: 'Extract video download link from YouTube',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play10 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🎬 *Savage-Tech is extracting video for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/video?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const videoUrl = res.data.downloadUrl || res.data.result;
        await sock.sendMessage(msg.key.remoteJid, { text: `🎬 *Video Ready:*\n${videoUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Video extraction error.' });
    }
  }
};
