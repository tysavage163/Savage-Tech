const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'imgbb',
  category: 'tools',
  description: 'Upload an image URL to ImgBB and get a direct link',
  async execute(sock, msg, args) {
    const imageUrl = args[0];
    if (!imageUrl || !imageUrl.startsWith('http')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .imgbb <image_url>' });
    }
    const sender = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    try {
      const form = new FormData();
      form.append('image', imageUrl);
      const res = await axios.post('https://api.imgbb.com/1/upload?key=58d35aff19ec093c8d46b54465b1f332', form, {
        headers: form.getHeaders(),
      });
      const uploadedUrl = res.data.data.url;
      await sock.sendMessage(msg.key.remoteJid, {
        text: `🖼️ *ImgBB upload for @${sender}*\n\n${uploadedUrl}\n\n🚀 POWERED BY SAVAGE-CORE`,
        mentions: mention,
      });
    } catch (err) {
      console.error('ImgBB error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Upload failed: ${err.message}` });
    }
  },
};
