module.exports = {
    name: "mute",
    category: "group",
    description: "Close the group (Admins only)",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { 
                text: "🔒 **SYSTEM LOCKED:** Group is now in Mute mode. Only Admins can transmit." 
            });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ *ERROR:* Failed to mute. Am I an Admin?" });
        }
    }
};
