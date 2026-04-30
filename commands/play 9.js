const axios = require('axios');

module.exports = {
  name: 'play9',
  category: 'audio',
  description: 'Direct MP4 download link',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play9 <YouTube URL or song name>' });

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `📹 *Savage-Tech is preparing direct MP4 for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/dLmp4?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const directUrl = res.data.downloadUrl || res.data.url;
        await sock.sendMessage(msg.key.remoteJid, { text: `📹 *Direct MP4:*\n${directUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Direct MP4 error.' });
    }
  }
};
