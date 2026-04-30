const axios = require('axios');
const https = require('https');

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'play6',
  category: 'audio',
  description: 'Convert YouTube to MP4 and send video',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play6 https://youtu.be/...' });
    }

    const senderName = msg.pushName || 'User';
    try {
      const apiUrl = `https://apis.xwolf.space/download/ytmp4?url=${encodeURIComponent(url)}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) throw new Error(res.data.error);

      let downloadUrl = res.data.downloadUrl || res.data.result;
      const buffer = await downloadFile(downloadUrl);
      if (buffer.length > 64 * 1024 * 1024) {
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ Video too large. Link:\n${downloadUrl}\n\nInspired by Meryl` });
        return;
      }

      const caption = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n📹 *Savage‑Tech is converting to MP4 for @${senderName}*\n\nInspired by Meryl`;
      await sock.sendMessage(msg.key.remoteJid, {
        video: buffer,
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: caption
      });
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ Conversion failed.\n\nInspired by Meryl` });
    }
  }
};
