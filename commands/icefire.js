const axios = require('axios');
const https = require('https');

<<<<<<< HEAD
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
=======
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

function downloadFile(url) {
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
>>>>>>> 5ea0653 (Added 27 text effect commands under Ephoto category with SSL fix)
    }).on('error', reject);
  });
}

module.exports = {
  name: 'icefire',
<<<<<<< HEAD
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
=======
  category: 'Ephoto',
  description: 'Generate ice-fire text effect',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .icefire <text>' });

    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mentions = [senderJid];

    try {
      const apiUrl = `https://apis.xwolf.space/api/textpro/ice-fire?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { httpsAgent });

      if (!response.data.success) throw new Error(response.data.error || 'API failure');
      if (!response.data.imageUrl) throw new Error('No imageUrl in response');

      const imgBuffer = await downloadFile(response.data.imageUrl);
      const caption = `🎨 *Text Effect: icefire*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;

      await sock.sendMessage(msg.key.remoteJid, {
        image: imgBuffer,
        caption: caption,
        mentions: mentions
      });
    } catch (err) {
      console.error('icefire error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to generate image.\n${err.message}` });
>>>>>>> 5ea0653 (Added 27 text effect commands under Ephoto category with SSL fix)
    }
  }
};
