module.exports = {
    name: 'groupsettings',
    category: 'group',
    description: 'Show current group settings',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        let groupName = from;
        try {
            const meta = await sock.groupMetadata(from);
            groupName = meta.subject;
        } catch (e) {}

        const antiLink = global.antiLinkConfig?.[from]?.enabled ? '✅ ON' : '❌ OFF';
        const antiLinkAction = global.antiLinkConfig?.[from]?.action || 'delete';
        const antiTag = global.antiTagConfig?.[from]?.enabled ? '✅ ON' : '❌ OFF';
        const antiTagAdmin = global.antiTagAdminConfig?.[from]?.enabled ? '✅ ON' : '❌ OFF';
        const antiMention = global.antiGroupMention?.[from] ? '✅ ON' : '❌ OFF';
        const antiLeave = global.antiLeave?.[from] ? '✅ ON' : '❌ OFF';
        const welcome = global.welcomeEnabled?.[from] ? '✅ ON' : '❌ OFF';
        const goodbye = global.goodbyeEnabled?.[from] ? '✅ ON' : '❌ OFF';
        const badWord = global.badWordEnabled?.[from] ? '✅ ON' : '❌ OFF';
        const badWordList = global.badWords?.[from] ? Array.from(global.badWords[from]).slice(0, 5).join(', ') : 'None';
        if (global.badWords?.[from]?.size > 5) badWordList += '...';

        const settings = `⚙️ *GROUP SETTINGS*\n📛 *${groupName}*\n🆔 ${from}\n\n` +
            `┌───¤  *ANTI-LINK*\n│  Status: ${antiLink}\n│  Action: ${antiLinkAction}\n│\n` +
            `├───¤  *ANTI-TAG (members)*\n│  Status: ${antiTag}\n│\n` +
            `├───¤  *ANTI-TAG (admins)*\n│  Status: ${antiTagAdmin}\n│\n` +
            `├───¤  *ANTI-GROUP MENTION*\n│  Status: ${antiMention}\n│\n` +
            `├───¤  *ANTI-LEAVE*\n│  Status: ${antiLeave}\n│\n` +
            `├───¤  *WELCOME/GODBYE*\n│  Welcome: ${welcome}\n│  Goodbye: ${goodbye}\n│\n` +
            `├───¤  *BAD WORD FILTER*\n│  Status: ${badWord}\n│  Words: ${badWordList}\n│\n` +
            `└───¤\n\n_⚡ Powered by Savage-Tech_`;

        await sock.sendMessage(from, { text: settings }, { quoted: msg });
    }
};
