module.exports = {
    name: 'groupsettings',
    category: 'group',
    description: 'Show all settings for current group',
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

        if (!global.groupSettings) global.groupSettings = {};
        if (!global.groupSettings[from]) global.groupSettings[from] = {};

        const settings = global.groupSettings[from];
        const keys = Object.keys(settings);

        let output = `⚙️ *GROUP SETTINGS*\n📛 *${groupName}*\n🆔 ${from}\n\n`;
        if (keys.length === 0) {
            output += `_No custom settings configured for this group._\n\nUse commands like:\n.antilink on, .welcome on, .badword add word\netc. to set them.`;
        } else {
            output += `┌───¤  *ACTIVE SETTINGS*\n`;
            for (const key of keys) {
                let value = settings[key];
                if (typeof value === 'object') {
                    value = JSON.stringify(value);
                }
                output += `│  🔹 ${key}: ${value}\n`;
            }
            output += `└───¤\n\n`;
        }
        output += `_⚡ Powered by Savage-Tech_`;

        await sock.sendMessage(from, { text: output }, { quoted: msg });
    }
};
