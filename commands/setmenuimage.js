module.exports = {
    name: 'setmenuimage',
    category: 'owner',
    description: 'Set a custom image URL for the .menu command (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });

        const imageUrl = args[0];
        if (!imageUrl || !imageUrl.startsWith('http')) {
            return sock.sendMessage(from, { text: '❓ Usage: .setmenuimage <direct_image_url>' });
        }

        // Set the global variable without validation
        global.menuImageUrl = imageUrl;
        await sock.sendMessage(from, { text: `✅ Menu image updated to:\n${imageUrl}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼` });
    }
};
