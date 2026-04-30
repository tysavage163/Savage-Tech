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
  name: 'play2',
  category: 'audio',
  description: 'Download MP3 and send as audio',
  async execute(sock, msg, args) {
    const input = args.join(' ');
    if (!input) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .play2 <YouTube URL or song name>' });

    const senderName = msg.pushName || 'User';
    try {
      const apiUrl = `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(input)}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) throw new Error(res.data.error || 'No download URL');

      let downloadUrl = res.data.downloadUrl || res.data.result || res.data.url;
      if (!downloadUrl) throw new Error('No download link');

      const buffer = await downloadFile(downloadUrl);
      if (buffer.length > 16 * 1024 * 1024) {
        // Fallback to link if too large
        await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n⚠️ File too large (${(buffer.length/1024/1024).toFixed(1)}MB). Direct link:\n${downloadUrl}\n\nInspired by Meryl` });
        return;
      }

      const caption = `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n🎵 *Savage‑Tech is playing @${senderName}*\n\nInspired by Meryl`;
      await sock.sendMessage(msg.key.remoteJid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3',
        caption: caption
      });
    } catch (error) {
      console.error(error);
      await sock.sendMessage(msg.key.remoteJid, { text: `🜏 SAVAGETECH // SIGNALS UNDER CONTROL\n\n❌ Failed to send audio.\n\nInspired by Meryl` });
    }
  }
};
