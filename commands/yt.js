const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent: httpsAgent }, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'yt',
  category: 'download',
  description: 'Download from yt',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .yt <URL>' });
    if (!url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Provide a valid URL starting with http:// or https://' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];

    try {
      const apiUrl = `https://apis.xwolf.space/download/youtube?url=${encodeURIComponent(url)}`;
      const response = await axios.get(apiUrl, { httpsAgent });
      const data = response.data;

      if (!data.success) throw new Error(data.error || 'Download failed');

      // Determine content type based on command name
      const isVideo = 'yt'.includes('video') || 'yt'.includes('mp4') || 'yt' === 'tiktok' || 'yt' === 'instagram' || 'yt' === 'facebook' || 'yt' === 'twitter' || 'yt' === 'snapchat';
      const isAudio = 'yt'.includes('mp3') || 'yt'.includes('audio');
      const isText = 'media' === 'text';

      if (isText) {
        // Send as text (info or search results)
        let text = `📁 *Download Info (yt)*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE\n\n`;
        if (data.result) text += data.result;
        else if (data.info) text += JSON.stringify(data.info, null, 2);
        else text += JSON.stringify(data, null, 2);
        await sock.sendMessage(msg.key.remoteJid, { text: text.slice(0, 2000), mentions: mention });
        return;
      }

      // For media: find download URL
      let downloadUrl = null;
      if (data.downloadUrl) downloadUrl = data.downloadUrl;
      else if (data.result && typeof data.result === 'string') downloadUrl = data.result;
      else if (data.url) downloadUrl = data.url;
      else if (data.media && data.media.url) downloadUrl = data.media.url;
      else if (data.video && data.video.url) downloadUrl = data.video.url;
      else if (data.audio && data.audio.url) downloadUrl = data.audio.url;
      else if (Array.isArray(data.result) && data.result.length > 0) {
        // Pick highest quality or first
        const best = data.result.find(r => r.quality === 'HD') || data.result[0];
        downloadUrl = best.url || best.downloadUrl;
      }
      if (!downloadUrl) throw new Error('No download link found in API response');

      const fileBuffer = await downloadFile(downloadUrl);
      const maxSize = isVideo ? 64 * 1024 * 1024 : 16 * 1024 * 1024; // video 64MB, audio 16MB
      if (fileBuffer.length > maxSize) {
        await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ File too large (${(fileBuffer.length/1024/1024).toFixed(1)}MB). Direct link: ${downloadUrl}` });
        return;
      }

      const caption = `📥 *Download: yt*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      if (isVideo) {
        await sock.sendMessage(msg.key.remoteJid, { video: fileBuffer, caption: caption, mentions: mention });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { audio: fileBuffer, mimetype: 'audio/mpeg', fileName: 'download.mp3', caption: caption, mentions: mention });
      }
    } catch (err) {
      console.error('yt error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Download failed.\n${err.message}` });
    }
  }
};
