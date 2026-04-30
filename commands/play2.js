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
    await sock.sendMessage(msg.key.remoteJid, { text: `🎵 *Savage-Tech is fetching audio for @${senderName}...*` });

    try {
      const apiUrl = `https://apis.xwolf.space/download/mp3?url=${encodeURIComponent(input)}`;
      const res = await axios.get(apiUrl);
      if (!res.data.success) throw new Error(res.data.error || 'No download URL');

      let downloadUrl = res.data.downloadUrl || res.data.result || res.data.url;
      if (!downloadUrl) throw new Error('No download link');

      const buffer = await downloadFile(downloadUrl);
      if (buffer.length > 16 * 1024 * 1024) {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ File too large (${(buffer.length/1024/1024).toFixed(1)}MB). Direct link:\n${downloadUrl}` });
        return;
      }

      await sock.sendMessage(msg.key.remoteJid, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      });
    } catch (error) {
      console.error(error);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to send audio. Try again later.' });
    }
  }
};
