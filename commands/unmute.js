module.exports = {
    name: "unmute",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: "🔓 **SΛVΛGΞ-TECH:** Group Unmuted." });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **ADMIN REQUIRED:** Elevate the bot to Admin." });
        }
    }
};
