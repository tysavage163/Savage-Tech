const axios = require('axios');

module.exports = {
  name: 'play4',
  category: 'audio',
  description: 'Extract audio from YouTube video',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play4 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🎧 *Savage-Tech is extracting audio for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/audio?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const audioUrl = res.data.downloadUrl || res.data.result;
        await sock.sendMessage(msg.key.remoteJid, { text: `🎧 *Audio extracted:*\n${audioUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Audio extraction error.' });
    }
  }
};
