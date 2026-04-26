module.exports = {
    name: "mode",
    category: "owner",
    description: "Switch bot between public and private mode",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;

        // 🛡️ THE FIREWALL: If it's not the person who paired (isMe), the bot stays silent.
        if (!isMe) return; 

        if (!args[0]) {
            const currentMode = global.worktype === 'public' ? '🔓 PUBLIC' : '🔐 PRIVATE';
            return sock.sendMessage(from, { 
                text: `*SΛVΛGΞ MODE SETTINGS*\n\n*Current Status:* ${currentMode}\n\n*Usage:*\n${global.prefix}mode public\n${global.prefix}mode private` 
            }, { quoted: msg });
        }

        const newMode = args[0].toLowerCase();
        if (newMode === "public") {
            global.worktype = "public";
            await sock.sendMessage(from, { text: "🔓 **SYSTEM UPDATE:** Bot is now in PUBLIC mode." });
        } else if (newMode === "private") {
            global.worktype = "private";
            await sock.sendMessage(from, { text: "🔐 **SYSTEM UPDATE:** Bot is now in PRIVATE mode." });
        }
    }
};
