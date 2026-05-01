const axios = require('axios');
const https = require('https');
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
    }).on('error', reject);
  });
}
module.exports = {
  name: 'retro',
  category: 'Ephoto',
  description: 'Generate retro text effect',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .retro <text>' });
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mentions = [senderJid];
    try {
      const apiUrl = `https://apis.xwolf.space/api/textpro/retro?text=${encodeURIComponent(text)}`;
      const response = await axios.get(apiUrl, { httpsAgent });
      if (!response.data.success) throw new Error(response.data.error || 'API failure');
      if (!response.data.imageUrl) throw new Error('No imageUrl in response');
      const imgBuffer = await downloadFile(response.data.imageUrl);
      const caption = `🎨 *Text Effect: retro*\n👤 REQUESTED BY: @${senderName}\n🚀 POWERED BY SAVAGE-CORE`;
      await sock.sendMessage(msg.key.remoteJid, { image: imgBuffer, caption: caption, mentions: mentions });
    } catch (err) {
      console.error('retro error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to generate image.\n${err.message}` });
    }
  }
};
