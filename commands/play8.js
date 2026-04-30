const axios = require('axios');

module.exports = {
  name: 'play8',
  category: 'audio',
  description: 'Direct MP3 download link',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play8 <YouTube URL or song name>' });

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *Savage-Tech is preparing direct MP3 for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/dLmp3?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const directUrl = res.data.downloadUrl || res.data.url;
        await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *Direct MP3:*\n${directUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Direct MP3 error.' });
    }
  }
};
