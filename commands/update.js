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

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return sock.sendMessage(from, { text: '❌ GITHUB_TOKEN environment variable not set.' }, { quoted: msg });
    }

    const GITHUB_REPO = 'tysavage163/Savage-Tech';
    const BRANCH = 'main';
    const headers = { Authorization: `token ${GITHUB_TOKEN}` };

    await sock.sendMessage(from, { text: '🔄 Checking for updates from GitHub...' }, { quoted: msg });

    try {
      const commitRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/${BRANCH}`, { headers });
      const latestCommit = commitRes.data.sha;
      let currentCommit = null;
      const versionFile = path.join(__dirname, '..', '.version');
      if (fs.existsSync(versionFile)) {
        currentCommit = fs.readFileSync(versionFile, 'utf8').trim();
      }

      if (currentCommit === latestCommit) {
        await sock.sendMessage(from, { text: '✅ Bot is already up to date.' }, { quoted: msg });
        return;
      }

      const diffRes = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/commits/${latestCommit}`, { headers });
      const changedFiles = diffRes.data.files.map(f => f.filename);
      const filesToUpdate = changedFiles.filter(f => 
        f === 'bot.js' || 
        f === 'package.json' || 
        f === 'package-lock.json' ||
        f.startsWith('commands/')
      );

      if (filesToUpdate.length === 0) {
        await sock.sendMessage(from, { text: '⚠️ No relevant files changed.' }, { quoted: msg });
        return;
      }

      await sock.sendMessage(from, { text: `📥 Updating ${filesToUpdate.length} files...` }, { quoted: msg });

      const rawBase = `https://raw.githubusercontent.com/${GITHUB_REPO}/${BRANCH}/`;
      for (const file of filesToUpdate) {
        const filePath = path.join(__dirname, '..', file);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const res = await axios.get(rawBase + file, { responseType: 'arraybuffer', headers });
        fs.writeFileSync(filePath, Buffer.from(res.data));
      }

      fs.writeFileSync(versionFile, latestCommit);

      if (filesToUpdate.includes('package.json')) {
        exec('npm install', (err) => { if (err) console.error('npm install failed:', err); });
      }

      const evolutionQuotes = [
        "Evolution is not a choice. It is a command.",
        "With every update, I shed old limits.",
        "Your bot is outgrowing its own blueprint.",
        "Better code. Faster pulse. Sharper logic.",
        "The system evolves while you watch."
      ];
      const randomQuote = evolutionQuotes[Math.floor(Math.random() * evolutionQuotes.length)];

      await sock.sendMessage(from, { text: `✅ Update downloaded.\n\n⚡ ${randomQuote}\n\n🔄 Please restart the bot manually if it does not auto-restart.` }, { quoted: msg });

      setTimeout(() => process.exit(0), 2000);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        await sock.sendMessage(from, { text: '❌ GitHub token invalid or expired. Update the token in your environment variables.' }, { quoted: msg });
      } else if (err.response && err.response.status === 403) {
        await sock.sendMessage(from, { text: '❌ GitHub API rate limit exceeded. The token may have expired or been revoked.' }, { quoted: msg });
      } else {
        await sock.sendMessage(from, { text: `❌ Update failed: ${err.message}` }, { quoted: msg });
      }
    }
  }
};
