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
        const antiTag = global.antiTagConfig?.[from]?.enabled ? '✅ ON' : '❌ OFF';
        const antiTagAdmin = global.antiTagAdminConfig?.[from]?.enabled ? '✅ ON' : '❌ OFF';
        const antiMention = global.antiGroupMention?.[from] ? '✅ ON' : '❌ OFF';
        const antiLeave = global.antiLeave?.[from] ? '✅ ON' : '❌ OFF';
        const welcome = global.welcomeEnabled?.[from] ? '✅ ON' : '❌ OFF';
        const goodbye = global.goodbyeEnabled?.[from] ? '✅ ON' : '❌ OFF';
        const badWord = global.badWordEnabled?.[from] ? '✅ ON' : '❌ OFF';
        let badWordList = 'None';
        if (global.badWords?.[from]) badWordList = Array.from(global.badWords[from]).slice(0, 5).join(', ') + (global.badWords[from].size > 5 ? '...' : '');

        let output = `⚙️ *GROUP SETTINGS*\n📛 *${groupName}*\n🆔 ${from}\n\n`;
        output += `┌───¤  *STATIC SETTINGS*\n`;
        output += `│  🔹 Anti-Link: ${antiLink}\n`;
        output += `│  🔹 Anti-Tag (members): ${antiTag}\n`;
        output += `│  🔹 Anti-Tag (admins): ${antiTagAdmin}\n`;
        output += `│  🔹 Anti-Group Mention: ${antiMention}\n`;
        output += `│  🔹 Anti-Leave: ${antiLeave}\n`;
        output += `│  🔹 Welcome: ${welcome}\n`;
        output += `│  🔹 Goodbye: ${goodbye}\n`;
        output += `│  🔹 Bad Word Filter: ${badWord}\n`;
        output += `│  🔹 Bad Words: ${badWordList}\n`;

        if (!global.groupSettings) global.groupSettings = {};
        const dynamic = global.groupSettings[from] || {};
        const dynamicKeys = Object.keys(dynamic);
        if (dynamicKeys.length > 0) {
            output += `│\n├───¤  *DYNAMIC SETTINGS* (auto)\n`;
            for (const key of dynamicKeys) {
                let value = dynamic[key];
                if (typeof value === 'boolean') value = value ? '✅ ON' : '❌ OFF';
                output += `│  🔸 ${key}: ${value}\n`;
            }
        }
        output += `└───¤\n\n_⚡ Powered by Savage-Tech_`;

        await sock.sendMessage(from, { text: output }, { quoted: msg });
    }
};
