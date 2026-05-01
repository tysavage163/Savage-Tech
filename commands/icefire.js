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
  name: 'icefire',
  category: 'textpro',
  description: 'Generate Ice Fire text effect',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .icefire Your text here' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mentionedJid = [senderJid];

    try {
      const apiUrl = `https://apis.xwolf.space/api/textpro/ice-fire?text=${encodeURIComponent(text)}`;
      const res = await axios.get(apiUrl, { responseType: 'arraybuffer' });
      let imageBuffer;
      if (res.headers['content-type']?.startsWith('image/')) {
        imageBuffer = Buffer.from(res.data);
      } else {
        const json = JSON.parse(res.data.toString());
        if (json.success && json.result) imageBuffer = await downloadFile(json.result);
        else throw new Error('No image');
      }
      const caption = `🎨 *Ice Fire Effect*\n👤 Requested by: @${senderName}\n🚀 SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { image: imageBuffer, caption, mentions: mentionedJid });
    } catch (error) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed: ${error.message}` });
    }
  }
};
