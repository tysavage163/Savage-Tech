const axios = require('axios');

module.exports = {
  name: 'play5',
  category: 'audio',
  description: 'Convert YouTube to MP3',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play5 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *Savage-Tech is converting to MP3 for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/ytmp3?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const downloadUrl = res.data.downloadUrl || res.data.result;
        await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *MP3 Ready:*\n${downloadUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ ytmp3 error.' });
    }
  }
};
