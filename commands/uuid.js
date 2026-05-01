const crypto = require('crypto');
module.exports = {
  name: 'uuid',
  category: 'tools',
  description: 'Generate UUID v4',
  async execute(sock, msg, args) {
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    const uuid = crypto.randomUUID();
    await sock.sendMessage(msg.key.remoteJid, { text: `🆔 *UUID for @${sender}*\n\n${uuid}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
