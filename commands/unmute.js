module.exports = {
    name: "unmute",
    category: "group",
    description: "Open the group for everyone",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe || !from.endsWith('@g.us')) return;

        try {
            await sock.groupSettingUpdate(from, 'not_announcement');
            await sock.sendMessage(from, { 
                text: "🔓 **SYSTEM UNLOCKED**\n\nAll members can now transmit data. Group is unmuted." 
            });
        } catch (err) {
            await sock.sendMessage(from, { 
                text: "❌ **PERMISSIONS FAILURE**\n\nElevate me to **Admin** to control the lock status." 
            });
        }
    }
};
