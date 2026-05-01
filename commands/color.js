const crypto = require('crypto');
function randomInt(min, max) { return crypto.randomInt(min, max + 1); }
module.exports = {
  name: 'color',
  category: 'tools',
  description: 'Generate random color with hex/rgb/hsl',
  async execute(sock, msg, args) {
    const r = randomInt(0, 255);
    const g = randomInt(0, 255);
    const b = randomInt(0, 255);
    const hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    const rgb = `rgb(${r}, ${g}, ${b})`;
    const hsl = `hsl(${randomInt(0, 360)}, ${randomInt(50, 100)}%, ${randomInt(40, 70)}%)`;
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    await sock.sendMessage(msg.key.remoteJid, { text: `🎨 *Random Color for @${sender}*\n\nHex: ${hex}\nRGB: ${rgb}\nHSL: ${hsl}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
