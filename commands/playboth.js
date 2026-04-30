const axios = require('axios');

module.exports = {
  name: 'playboth',
  category: 'audio',
  description: 'Get MP3 and MP4 download links',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .playboth https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    try {
      const apiUrl = `https://apis.xwolf.space/download/ytmp5?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (res.data.success) {
        const mp3 = res.data.mp3 || res.data.audio;
        const mp4 = res.data.mp4 || res.data.video;
        let reply = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚡ *SΛVΛGΞ-TECH fetched both formats for @${senderName}*\n\n🎵 MP3: ${mp3}\n📹 MP4: ${mp4}\n\nInspired by Meryl`;
        await sock.sendMessage(msg.key.remoteJid, { text: reply.slice(0, 2000) });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ ${res.data.error || 'Failed'}\n\nInspired by Meryl` });
      }
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ playboth error.\n\nInspired by Meryl` });
    }
  }
};
