module.exports = {
  name: 'timestamp',
  category: 'tools',
  description: 'Get current timestamp in multiple formats',
  async execute(sock, msg, args) {
    const now = new Date();
    const unix = Math.floor(now.getTime() / 1000);
    const iso = now.toISOString();
    const local = now.toLocaleString();
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    const result = `Unix: ${unix}\nISO: ${iso}\nLocal: ${local}`;
    await sock.sendMessage(msg.key.remoteJid, { text: `⏱️ *Current Timestamp for @${sender}*\n\n${result}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
