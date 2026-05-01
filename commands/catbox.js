const axios = require('axios');
const FormData = require('form-data');

module.exports = {
  name: 'catbox',
  category: 'tools',
  description: 'Upload a file URL to Catbox.moe and get a direct link',
  async execute(sock, msg, args) {
    const fileUrl = args[0];
    if (!fileUrl || !fileUrl.startsWith('http')) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .catbox <file_url>' });
    }
    const sender = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    try {
      const form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', fileUrl);
      const res = await axios.post('https://catbox.moe/user/api.php', form, {
        headers: form.getHeaders(),
      });
      await sock.sendMessage(msg.key.remoteJid, {
        text: `📦 *Catbox upload for @${sender}*\n\n${res.data.trim()}\n\n🚀 POWERED BY SAVAGE-CORE`,
        mentions: mention,
      });
    } catch (err) {
      console.error('Catbox error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Upload failed: ${err.message}` });
    }
  },
};
