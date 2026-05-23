const axios = require('axios');

module.exports = {
    name: 'repo',
    category: 'engine',
    description: 'Shows the bot GitHub repository information',

    async execute(sock, msg) {
        const from = msg.key.remoteJid;

        const repoOwner = 'tysavage163';
        const repoName = 'Savage-Tech';

        const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}`;

        try {
            const { data } = await axios.get(apiUrl, {
                headers: {
                    'User-Agent': 'Savage-Tech-Bot'
                }
            });

            const stars = data.stargazers_count.toLocaleString();
            const forks = data.forks_count.toLocaleString();
            const watchers = data.watchers_count.toLocaleString();
            const sizeKB = data.size.toLocaleString();
            const updated = new Date(data.updated_at).toLocaleString();

            const repoUrl = data.html_url;
            const description =
                data.description || 'WhatsApp bot based on Baileys';

            const avatarUrl = data.owner.avatar_url;
            const repoFull = data.full_name;
            const ownerName = data.owner.login;

            const senderJid =
                msg.key.participant || msg.key.remoteJid;

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
┃ 👋 *Hey ${mentionText}!*
┃ ⭐ *Fork and star the repo!*
╰━━━━━━━━━━━━━━━╯`;

            await sock.sendMessage(
                from,
                {
                    image: { url: avatarUrl },
                    caption,
                    mentions: mention
                },
                { quoted: msg }
            );

        } catch (error) {
            console.error('Repo command error:', error);

            let errorMsg = '❌ Failed to fetch repository data.';

            if (error.response?.status === 404) {
                errorMsg = '❌ Repository not found.';
            }

            await sock.sendMessage(
                from,
                { text: errorMsg },
                { quoted: msg }
            );
        }
    }
};
