const axios = require('axios');

module.exports = {
  name: 'repo',
  category: 'engine',
  description: 'Shows the bot\'s GitHub repository information',
  async execute(sock, msg) {
    const from = msg.key.remoteJid;
    const GITHUB_TOKEN = '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';
    const apiUrl = 'https://api.github.com/repos/tysavage163/Savage-Tech';

    try {
      const { data } = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'Savage-Tech-Bot',
          'Authorization': `token ${GITHUB_TOKEN}`
        }
      });
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
    } catch (error) {
      console.error('Repo command error:', error);
      let errorMsg = '❌ Failed to fetch repository data.';
      if (error.response && error.response.status === 401) {
        errorMsg = '❌ GitHub token invalid or expired. Update the token in the command file.';
      } else if (error.response && error.response.status === 403) {
        errorMsg = '❌ GitHub API rate limit exceeded. The token may have expired or been revoked.';
      } else if (error.response && error.response.status === 404) {
        errorMsg = '❌ Repository not found.';
      }
      await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
    }
  }
};
