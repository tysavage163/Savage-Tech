module.exports = {
    name: "unmute",
    category: "group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { text: "🔓 **SΛVΛGΞ:** Group Unmuted." });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **FAIL:** Ensure I am Admin." });
        }
    }
};
