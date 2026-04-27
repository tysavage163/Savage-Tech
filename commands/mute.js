module.exports = {
    name: "mute",
    category: "group",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { text: "🔒 **SΛVΛGΞ:** Group Muted." });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **FAIL:** Ensure I am Admin." });
        }
    }
};
