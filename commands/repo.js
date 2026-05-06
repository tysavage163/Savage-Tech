const axios = require('axios');

module.exports = {
    name: 'repo',
    category: 'owner',
    description: 'Shows the bot\'s GitHub repository information',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const repoOwner = 'tysavage163';
        const repoName = 'Savage-Tech';
        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;

        try {
            const { data } = await axios.get(apiUrl);
            const stars = data.stargazers_count.toLocaleString();
            const forks = data.forks_count.toLocaleString();
            const watchers = data.watchers_count.toLocaleString();
            const sizeKB = data.size; // already in KB
            const updated = new Date(data.updated_at).toLocaleString();
            const repoUrl = data.html_url;
            const description = data.description || 'WhatsApp bot based on Baileys';
            const avatarUrl = data.owner.avatar_url;
            const repoFull = data.full_name;
            const ownerName = data.owner.login;
            
            const senderName = msg.pushName || 'User';
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const mention = [senderJid];

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
┃ 👋 *Hey @${senderName}!* 😈
┃ *Don't forget to fork and star the repo!* ⚡
╰━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(from, {
                image: { url: avatarUrl },
                caption: caption,
                mentions: mention
            });
        } catch (error) {
            console.error('Repo command error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to fetch repository data. Please try again later.'
            });
        }
    }
};
