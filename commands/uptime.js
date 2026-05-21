const os = require('os');
const fs = require('fs');

function detectHost() {
  if (process.env.RENDER) return 'Render Cloud';
  if (process.env.DYNO) return 'Heroku Dyno';
  if (process.env.KOYEB) return 'Koyeb';
  if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
  if (process.env.VERCEL) return 'Vercel';
  if (process.env.REPLIT_DB_URL) return 'Replit';
  if (process.env.COOLIFY) return 'Coolify';
  if (process.env.SERVER_ID || process.env.PTERODACTYL) return 'Panel';
  if (fs.existsSync('/home/container') || process.env.USER === 'container') return 'Panel';
  if (os.platform() === 'linux') {
    if (process.env.PREFIX === '/data/data/com.termux/usr' || fs.existsSync('/data/data/com.termux')) return 'Termux (Android)';
    return 'Linux VPS';
  }
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
  name: 'uptime',
  category: 'engine',
  description: 'Show bot uptime and hosting platform',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const host = detectHost();
    const uptimeFormatted = formatUptime(process.uptime());
    const text = `🖥️ *RUNNING ON*: ${host}\n⏱️ *FOR*: ${uptimeFormatted}`;
    await sock.sendMessage(from, { text }, { quoted: msg });
  }
};
