const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function downloadFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { agent }, (res) => {
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

async function getMediaBufferFromMessage(sock, msg) {
  // Check if replying to a message
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (!quoted) return null;

  let mediaType = null;
  let mediaMsg = null;

  if (quoted.imageMessage) {
    mediaType = 'image';
    mediaMsg = quoted.imageMessage;
  } else if (quoted.videoMessage) {
    mediaType = 'video';
    mediaMsg = quoted.videoMessage;
  } else if (quoted.stickerMessage) {
    mediaType = 'sticker';
    mediaMsg = quoted.stickerMessage;
  }

  if (!mediaMsg) return null;

  // Download the media
  const stream = await sock.downloadMediaMessage({ message: { [mediaType + 'Message']: mediaMsg } });
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', chunk => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

module.exports = {
  name: 'img-to-sticker',
  category: 'tools',
  description: 'Convert media using img-to-sticker (reply to image/video/sticker OR provide URL)',
  async execute(sock, msg, args) {
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;

    let mediaBuffer = null;
    let providedUrl = args[0];

    // Try to get media from replied message first
    if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
      mediaBuffer = await getMediaBufferFromMessage(sock, msg);
    }

    // If no reply and no URL, error
    if (!mediaBuffer && !providedUrl) {
      return sock.sendMessage(msg.key.remoteJid, { 
        text: '❓ Usage: .img-to-sticker\n   - Reply to an image/video/sticker\n   - Or provide a direct URL: .img-to-sticker https://example.com/media.jpg',
        mentions: [jid]
      });
    }

    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🔄 Converting media for @' + sender + '...', mentions: [jid] });

      let apiUrl;
      if (mediaBuffer) {
        // For media buffer, we need to upload as multipart or base64? The API likely expects a URL.
        // Since the Wolf API converter endpoints expect a URL, we cannot directly send buffer.
        // Workaround: Upload buffer to a temp hosting? Too complex. Alternative: send the media as base64 in JSON?
        // Let's assume the API accepts base64 in a JSON payload. But the documentation shows GET with ?url=.
        // For now, we'll convert buffer to a data URL and use that.
        const base64 = mediaBuffer.toString('base64');
        const mime = (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage?.mimetype) || 
                     (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage?.mimetype) || 
                     'application/octet-stream';
        const dataUrl = `data:${mime};base64,${base64}`;
        apiUrl = `https://apis.xwolf.space/api/converter/img-to-sticker?url=${encodeURIComponent(dataUrl)}`;
      } else {
        apiUrl = `https://apis.xwolf.space/api/converter/img-to-sticker?url=${encodeURIComponent(providedUrl)}`;
      }

      const response = await axios.get(apiUrl, { agent, responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'] || '';
      const resultBuffer = Buffer.from(response.data);

      const caption = `✅ *Converted via img-to-sticker*\n👤 REQUESTED BY: @${sender}\n🚀 POWERED BY SAVAGE-CORE`;

      if (contentType.includes('video')) {
        await sock.sendMessage(msg.key.remoteJid, { video: resultBuffer, caption: caption, mentions: [jid] });
      } else if (contentType.includes('image') || contentType.includes('webp')) {
        await sock.sendMessage(msg.key.remoteJid, { image: resultBuffer, caption: caption, mentions: [jid] });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: caption + '\n\n' + resultBuffer.toString('utf-8').slice(0, 500) });
      }
    } catch (err) {
      console.error('img-to-sticker error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Conversion failed: ${err.message}` });
    }
  }
};
