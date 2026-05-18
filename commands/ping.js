module.exports = {
  name: 'ping',
  category: 'engine',
  description: 'Check bot response speed',
  async execute(sock, msg, args) {
    const msgTimestamp = msg.messageTimestamp * 1000;
    const networkLatency = Date.now() - msgTimestamp;

    const text = `⚡ *Savage Tech Speed* ⚡\n\n*Pong!* ${networkLatency} ms\n\n_⚡ Savage-Tech OS_`;

    await sock.sendMessage(msg.key.remoteJid, { text: text }, { quoted: msg });
  }
};
