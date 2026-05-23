const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'repo',
  category: 'engine',
  description: 'Shows the bot\'s GitHub repository information',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const cacheFile = path.join(__dirname, '..', '.repo_cache.json');
    const CACHE_TTL = 12 * 60 * 60 * 1000;
    let cache = { data: null, timestamp: 0 };
    if (fs.existsSync(cacheFile)) {
      try {
        cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (e) {}
    }
    const now = Date.now();
    if (cache.data && (now - cache.timestamp) < CACHE_TTL) {
      const data = cache.data;
      await sendRepoMessage(sock, from, data, msg);
      return;
    }
    try {
      const { data } = await axios.get('https://api.github.com/repos/tysavage163/Savage-Tech', {
        headers: { 'User-Agent': 'Savage-Tech-Bot' }
      });
      cache = { data, timestamp: now };
      fs.writeFileSync(cacheFile, JSON.stringify(cache));
      await sendRepoMessage(sock, from, data, msg);
    } catch (error) {
      console.error('Repo command error:', error);
      let errorMsg = '❌ Failed to fetch repository data.';
      if (error.response && error.response.status === 403 && error.response.headers['x-ratelimit-remaining'] === '0') {
        errorMsg = '❌ GitHub API rate limit exceeded. Please try again later.';
      } else if (error.response && error.response.status === 404) {
        errorMsg = '❌ Repository not found.';
      }
      await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
    }
  }
};

async function sendRepoMessage(sock, from, data, msg) {
  const stars = data.stargazers_count.toLocaleString();
  const forks = data.forks_count.toLocaleString();
  const watchers = data.watchers_count.toLocaleString();
  const sizeKB = data.size;
  const updated = new Date(data.updated_at).toLocaleString();
  const repoUrl = data.html_url;
  const description = data.description || 'WhatsApp bot based on Baileys';
  const avatarUrl = data.owner.avatar_url;
  const repoFull = data.full_name;
  const ownerName = data.owner.login;

  const senderJid = msg.key.participant || msg.key.remoteJid;
  const mention = [senderJid];
  const mentionText = `@${senderJid.split('@')[0]}`;

  const caption = `╭━━━━━━━━━━━━━━━╮
┃ *📦 SAVAGE REPO*
┃
┃ 🧠 *Name:* ${repoFull}
┃ 👑 *Owner:* ${ownerName}
┃ ⭐ *Stars:* ${stars}
┃ 🍴 *Forks:* ${forks}
┃ 👁️ *Watchers:* ${watchers}
┃ 📦 *Size:* ${sizeKB} KB
┃ 🕒 *Updated:* ${updated}
┃ 🔗 *Repo:* ${repoUrl}
┃ 📝 *Description:* ${description}
┃
┃ 👋 *Hey ${mentionText}!* 😈
┃ *Don't forget to ⭐ fork and star the repo!* ⚡
┃ *Tap the link above to open*
╰━━━━━━━━━━━━━━━╯`;

  await sock.sendMessage(from, { image: { url: avatarUrl }, caption: caption, mentions: mention }, { quoted: msg });
}
