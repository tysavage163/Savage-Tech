module.exports = {
    name: "mute",
    category: "group",
    description: "Close the group for non-admins",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'announcement');
            await sock.sendMessage(from, { 
                text: "🔒 **SYSTEM LOCKED**\n\nOnly admins can send messages now. SΛVΛGΞ-TECH protocol active." 
            });
        } catch (err) {
            await sock.sendMessage(from, { 
                text: "❌ **PERMISSIONS FAILURE**\n\nI cannot lock this group unless I am promoted to **Admin** status." 
            });
        }
    }
};
