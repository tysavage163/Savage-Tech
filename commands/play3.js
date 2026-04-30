const axios = require('axios');

module.exports = {
  name: 'play3',
  category: 'audio',
  description: 'Download MP4 video from YouTube URL or song name',
  async execute(sock, msg, args) {
    const input = args.join(' ');
    if (!input) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play3 <YouTube URL or song name>' });

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `🎬 *Savage-Tech is playing @${senderName}'s video...*` });

    try {
      const url = `https://apis.xwolf.space/download/mp4?url=${encodeURIComponent(input)}`;
      const res = await axios.get(url);
      if (res.data.success) {
        const downloadUrl = res.data.downloadUrl || res.data.result || res.data.url;
        await sock.sendMessage(msg.key.remoteJid, { text: `📹 *MP4 Ready:*\n${downloadUrl}` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ MP4 error.' });
    }
  }
};
