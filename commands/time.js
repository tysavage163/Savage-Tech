module.exports = {
  name: 'time',
  category: 'engine',
  description: 'Show current date and time',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const text = `🕐 *CURRENT TIME*\n\n📅 Date: ${date}\n⏰ Time: ${time}\n🌍 Timezone: ${timezone}`;
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};
