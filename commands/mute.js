module.exports = {
    name: "mute",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: "🔒 **SΛVΛGΞ-TECH:** Group Muted." });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **ADMIN REQUIRED:** Elevate the bot to Admin." });
        }
    }
};
