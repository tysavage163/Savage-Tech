const axios = require('axios');

module.exports = {
  name: 'play7',
  category: 'audio',
  description: 'Get MP3 and MP4 download links',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play7 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    await sock.sendMessage(msg.key.remoteJid, { text: `⚡ *Savage-Tech is fetching both formats for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/ytmp5?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const mp3 = res.data.mp3 || res.data.audio;
        const mp4 = res.data.mp4 || res.data.video;
        let reply = `🎵 MP3: ${mp3}\n📹 MP4: ${mp4}`;
        await sock.sendMessage(msg.key.remoteJid, { text: reply.slice(0, 2000) });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ ${res.data.error || 'Failed'}` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ play7 error.' });
    }
  }
};
