const QRCode = require('qrcode');

module.exports = {
  name: 'qrcode',
  category: 'tools',
  description: 'Generate QR code from text (local, no API)',
  async execute(sock, msg, args) {
    const text = args.join(' ');
    if (!text) return sock.sendMessage(msg.key.remoteJid, { text: '❓ Usage: .qrcode <text or URL>' });
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    try {
      const buffer = await QRCode.toBuffer(text, { errorCorrectionLevel: 'H', margin: 1 });
      await sock.sendMessage(msg.key.remoteJid, {
        image: buffer,
        caption: `📱 *QR Code for @${sender}*\n\nContent: ${text.slice(0, 100)}\n\n🚀 POWERED BY SAVAGE-CORE`,
        mentions: [jid]
      });
    } catch (err) {
      await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error: ${err.message}` });
    }
  }
};
