const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

module.exports = {
  name: 'update',
  category: 'owner',
  description: 'Update bot from GitHub (owner & sudo only)',
  async execute(sock, msg, args, { isMe }) {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;

    const isOwner = global.ownerJid && sender === global.ownerJid;
    const isSudo = global.sudoers && Array.isArray(global.sudoers) && global.sudoers.includes(sender);

    if (!isMe && !isOwner && !isSudo) {
      return sock.sendMessage(from, { text: '❌ Only owner and sudo users can use this command.' }, { quoted: msg });
    }

    const GITHUB_REPO = 'tysavage163/Savage-Tech';
    const BRANCH = 'main';
    const headers = { 'User-Agent': 'Savage-Tech-Bot' };
    const cacheFile = path.join(__dirname, '..', '.update_cache.json');
    const CACHE_TTL = 12 * 60 * 60 * 1000;

    let cached = null;
    if (fs.existsSync(cacheFile)) {
      try {
        cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {}
    }
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      let statusMsg = await sock.sendMessage(from, { text: '🔄 Checking for updates (cached)...' }, { quoted: msg });
      await performUpdate(sock, from, msg, cached.latestCommit, cached.currentCommit, headers, statusMsg.key);
      return;
    }

    let statusMsg = await sock.sendMessage(from, { text: '🔄 Checking for updates...' }, { quoted: msg });
    try {
      const commitRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/${BRANCH}`, { headers });
      const latestCommit = commitRes.data.sha;
      let currentCommit = null;
      const versionFile = path.join(__dirname, '..', '.version');
      if (fs.existsSync(versionFile)) {
        currentCommit = fs.readFileSync(versionFile, 'utf8').trim();
      }
      fs.writeFileSync(cacheFile, JSON.stringify({ latestCommit, currentCommit, timestamp: now }));
      await performUpdate(sock, from, msg, latestCommit, currentCommit, headers, statusMsg.key);
    } catch (err) {
      console.error(err);
      let errorMsg = '❌ Update failed.';
      if (err.response && err.response.status === 403 && err.response.headers['x-ratelimit-remaining'] === '0') {
        errorMsg = '❌ GitHub API rate limit exceeded. Please try again later.';
      } else if (err.response && err.response.status === 404) {
        errorMsg = '❌ Repository or commit not found.';
      } else {
        errorMsg = `❌ Update failed: ${err.message}`;
      }
      await sock.sendMessage(from, { text: errorMsg, edit: statusMsg.key }, { quoted: msg });
    }
  }
};

async function performUpdate(sock, from, originalMsg, latestCommit, currentCommit, headers, statusKey) {
  if (currentCommit === latestCommit) {
    await sock.sendMessage(from, { text: '✅ Bot is already up to date.', edit: statusKey }, { quoted: originalMsg });
    return;
  }

  await sock.sendMessage(from, { text: '📥 Fetching update information...', edit: statusKey }, { quoted: originalMsg });

  const GITHUB_REPO = 'tysavage163/Savage-Tech';
  const BRANCH = 'main';
  try {
    const diffRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/${latestCommit}`, { headers });
    const changedFiles = diffRes.data.files.map(f => f.filename);
    const filesToUpdate = changedFiles.filter(f => 
      f === 'bot.js' || 
      f === 'package.json' || 
      f === 'package-lock.json' ||
      f.startsWith('commands/')
    );

    if (filesToUpdate.length === 0) {
      await sock.sendMessage(from, { text: '⚠️ No relevant files changed.', edit: statusKey }, { quoted: originalMsg });
      return;
    }

    await sock.sendMessage(from, { text: `📦 Downloading ${filesToUpdate.length} files...`, edit: statusKey }, { quoted: originalMsg });

    const rawBase = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/`;
    for (const file of filesToUpdate) {
      const filePath = path.join(__dirname, '..', file);
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const res = await axios.get(rawBase + file, { responseType: 'arraybuffer', headers });
      fs.writeFileSync(filePath, Buffer.from(res.data));
    }

    const versionFile = path.join(__dirname, '..', '.version');
    fs.writeFileSync(versionFile, latestCommit);

    if (filesToUpdate.includes('package.json')) {
      await sock.sendMessage(from, { text: '📦 Installing dependencies...', edit: statusKey }, { quoted: originalMsg });
      exec('npm install', (err) => { if (err) console.error('npm install failed:', err); });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    const evolutionQuotes = [
      "Evolution is not a choice. It is a command.",
      "With every update, I shed old limits.",
      "Your bot is outgrowing its own blueprint.",
      "Better code. Faster pulse. Sharper logic.",
      "The system evolves while you watch."
    ];
    const randomQuote = evolutionQuotes[Math.floor(Math.random() * evolutionQuotes.length)];

    await sock.sendMessage(from, { text: `✅ Update completed.\n\n⚡ ${randomQuote}\n\n🔄 Restarting bot...`, edit: statusKey }, { quoted: originalMsg });

    setTimeout(() => process.exit(0), 2000);
  } catch (err) {
    console.error(err);
    await sock.sendMessage(from, { text: `❌ Update failed: ${err.message}`, edit: statusKey }, { quoted: originalMsg });
  }
}
