const crypto = require('crypto');
module.exports = {
  name: 'password',
  category: 'tools',
  description: 'Generate secure random password',
  async execute(sock, msg, args) {
    let length = parseInt(args[0]) || 12;
    if (length < 6) length = 6;
    if (length > 32) length = 32;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, chars.length);
      password += chars[randomIndex];
    }
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    await sock.sendMessage(msg.key.remoteJid, { text: `🔑 *Generated password (${length} chars) for @${sender}*\n\n${password}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
