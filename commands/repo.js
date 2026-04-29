const axios = require('axios');

module.exports = {
    name: 'repo',
    category: 'owner',      // This places it under Owner menu
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
            const repoUrl = data.html_url;
            const description = data.description || 'WhatsApp bot based on Baileys';
            const avatarUrl = data.owner.avatar_url;
            const repoFull = data.full_name;

            const caption = `╭━━━━━━━━━━━━━━━╮
┃ *📦 REPOSITORY INFO*
┃
┃ 🧠 *Name:* ${repoFull}
┃ ⭐ *Stars:* ${stars}
┃ 🔱 *Forks:* ${forks}
┃ 🔗 *Link:* ${repoUrl}
┃ 📝 *Description:* ${description}
┃
┃ 👑 *Owner:* ${data.owner.login}
╰━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(from, {
                image: { url: avatarUrl },
                caption: caption
            });
        } catch (error) {
            console.error('Repo command error:', error);
            await sock.sendMessage(from, {
                text: '❌ Failed to fetch repository data. Please try again later.'
            });
        }
    }
};
