module.exports = {
    name: "unmute",
    category: "group",
    description: "Open the group (Everyone)",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { 
                text: "🔓 **SYSTEM UNLOCKED:** Group is now Unmuted. All members can transmit." 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ *ERROR:* Failed to unmute. Am I an Admin?" });
        }
    }
};
