const axios = require('axios');
const https = require('https');
const httpsAgent = new https.Agent({ rejectUnauthorized: false });
module.exports = {
  name: 'deep',
  category: 'Audio Effects',
  description: 'Apply deep effect to audio',
  async execute(sock, msg, args) {
    const url = args[0];
    if (!url) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .deep <audio_url>' });
    if (!url.startsWith('http')) return sock.sendMessage(msg.key.remoteJid, { text: '❌ Invalid URL.' });
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    try {
      await sock.sendMessage(msg.key.remoteJid, { text: '🎧 Applying deep effect for @' + senderName + '...', mentions: mention });
      const apiUrl = 'https://apis.xwolf.space/api/audio/deep?url=' + encodeURIComponent(url);
      const response = await axios.get(apiUrl, { httpsAgent });
      let base64Audio = response.data.result?.base64Data || response.data.base64Data;
      if (!base64Audio && typeof response.data.result === 'string') base64Audio = response.data.result;
      if (!base64Audio) throw new Error('No audio data in response');
      if (base64Audio.startsWith('data:audio')) base64Audio = base64Audio.split(',')[1];
      const audioBuffer = Buffer.from(base64Audio, 'base64');
      const caption = '✨ deep Effect Applied\n👤 REQUESTED BY: @' + senderName + '\n🚀 POWERED BY SAVAGE-CORE';
      await sock.sendMessage(msg.key.remoteJid, { audio: audioBuffer, mimetype: 'audio/mpeg', fileName: 'deep_effect.mp3', caption: caption, mentions: mention });
    } catch (err) {
      console.error('deep error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed: ' + err.message });
    }
  }
};
