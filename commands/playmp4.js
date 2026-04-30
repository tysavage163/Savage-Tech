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
  name: 'playmp4',
  category: 'audio',
  description: 'Download MP4 and send as video',
  async execute(sock, msg, args) {
    const input = args.join(' ');
    if (!input) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .playmp4 <YouTube URL or song name>' });

    const senderName = msg.pushName || 'User';
    try {
      const apiUrl = `https://apis.xwolf.space/download/mp4?url=${encodeURIComponent(input)}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) throw new Error(res.data.error);

      let downloadUrl = res.data.downloadUrl || res.data.result || res.data.url;
      const buffer = await downloadFile(downloadUrl);
      if (buffer.length > 64 * 1024 * 1024) {
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ Video too large. Link:\n${downloadUrl}\n\nInspired by Meryl` });
        return;
      }

      const caption = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n🎬 *SΛVΛGΞ-TECH is playing @${senderName} music video*\n\nInspired by Meryl`;
      await sock.sendMessage(msg.key.remoteJid, {
        video: buffer,
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: caption
      });
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ Video send failed.\n\nInspired by Meryl` });
    }
  }
};
