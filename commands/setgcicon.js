module.exports = {
    name: "setgcicon",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const url = args[0];
        if (!from.endsWith('@g.us') || !url) return;

        try {
            await sock.updateProfilePicture(from, { url: url });
            await sock.sendMessage(from, { text: "🖼️ **SΛVΛGΞ:** Group icon updated successfully." });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **ERROR:** Failed to update icon. Check the link or Admin status." });
        }
    }
};
