const os = require('os');
const fs = require('fs');

function getHostPlatform() {
  if (process.env.DYNO) return 'Heroku (Dyno)';
  if (process.env.RENDER) return 'Render';
  if (process.env.VERCEL) return 'Vercel';
  if (process.env.KOYEB) return 'Koyeb';
  if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
  if (process.env.REPLIT_DB_URL) return 'Replit';
  if (process.env.COOLIFY) return 'Coolify';
  if (process.env.SERVER_ID || process.env.PTERODACTYL) return 'Panel';
  if (fs.existsSync('/home/container') || process.env.USER === 'container') return 'Panel';
  if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux (Android)';
  if (os.platform() === 'linux') return 'Linux (VPS / Dedicated)';
  if (os.platform() === 'win32') return 'Windows';
  if (os.platform() === 'darwin') return 'macOS';
  return 'Unknown / Local';
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

module.exports = {
  name: 'host',
  category: 'engine',
  description: 'Show bot host information and uptime',
  async execute(sock, msg, args) {
    const uptimeSec = process.uptime();
    const uptimeFormatted = formatUptime(uptimeSec);
    const platform = getHostPlatform();
    const nodeVersion = process.version;
    const arch = os.arch();
    const cpuCores = os.cpus().length;
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);
    const usedMem = (totalMem - freeMem).toFixed(0);
    
    const text = `🖥️ *HOST INFORMATION*\n\n` +
      `🏠 *Platform:* ${platform}\n` +
      `⏱️ *Uptime:* ${uptimeFormatted}\n` +
      `📦 *Node.js:* ${nodeVersion}\n` +
      `🔧 *Architecture:* ${arch}\n` +
      `💻 *CPU Cores:* ${cpuCores}\n` +
      `🧠 *Memory:* ${usedMem}MB / ${totalMem}MB used`;
    
    await sock.sendMessage(msg.key.remoteJid, { text: text }, { quoted: msg });
  }
};
