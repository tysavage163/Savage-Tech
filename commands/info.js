const os = require('os');
const packageJson = require('../package.json');

module.exports = {
  name: 'info',
  category: 'engine',
  description: 'Detailed bot and system information',
  async execute(sock, msg) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMem = totalMem - freeMem;
    
    const text = `📊 *BOT INFO*\n\n` +
      `🤖 Name: ${packageJson.name}\n` +
      `🔢 Version: ${packageJson.version}\n` +
      `⏱️ Uptime: ${uptimeStr}\n` +
      `💻 Platform: ${os.platform()} ${os.arch()}\n` +
      `🐧 OS: ${os.type()} ${os.release()}\n` +
      `🧠 Memory: ${usedMem}MB / ${totalMem}MB\n` +
      `🟢 Node.js: ${process.version}`;
    
    await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
  }
};
