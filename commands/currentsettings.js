module.exports = {
    name: 'currentsettings',
    category: 'owner',
    description: 'Show current bot settings (owner & sudo only)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isSudo = global.sudo && (global.sudo.has ? global.sudo.has(sender) : global.sudo.includes(sender));
        if (!isArchitect && !isSudo) {
            return sock.sendMessage(from, { text: '❌ Owner or sudo only command.' }, { quoted: msg });
        }

        const prefix = global.prefix || '.';
        const mode = global.worktype === 'public' ? '🌍 Public' : '🔒 Private';
        const autoRead = global.autoRead ? '✅ ON' : '❌ OFF';
        const autoTyping = global.autoTyping === 'on' ? '✅ ON' : '❌ OFF';
        const alwaysRecording = global.alwaysRecording === true ? '✅ ON' : '❌ OFF';
        const alwaysOnline = global.alwaysOnline !== false ? '✅ ON' : '❌ OFF';
        const autoViewStatus = global.autoViewStatus === 'on' ? '✅ ON' : '❌ OFF';
        const antiDelete = global.antiDeleteEnabled ? '✅ ON' : '❌ OFF';
        const antiEdit = global.antiEditEnabled ? '✅ ON' : '❌ OFF';
        const anticallMode = global.anticall?.mode === 'off' ? '❌ OFF' : (global.anticall?.mode === 'decline' ? '🔊 Decline' : '🚫 Block');

        let output = `⚙️ *CURRENT BOT SETTINGS*\n\n`;
        output += `┌───¤  *STATIC SETTINGS*\n`;
        output += `│  🔹 Prefix: ${prefix}\n`;
        output += `│  🔹 Mode: ${mode}\n`;
        output += `│  🔹 Auto Read: ${autoRead}\n`;
        output += `│  🔹 Auto Typing: ${autoTyping}\n`;
        output += `│  🔹 Always Recording: ${alwaysRecording}\n`;
        output += `│  🔹 Always Online: ${alwaysOnline}\n`;
        output += `│  🔹 Auto View Status: ${autoViewStatus}\n`;
        output += `│  🔹 Anti‑Delete: ${antiDelete}\n`;
        output += `│  🔹 Anti‑Edit: ${antiEdit}\n`;
        output += `│  🔹 Anti‑Call: ${anticallMode}\n`;

        if (!global.botSettings) global.botSettings = {};
        const dynamic = global.botSettings;
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
