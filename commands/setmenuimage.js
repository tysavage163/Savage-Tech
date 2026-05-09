const axios = require('axios');
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

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

        // Validate the image URL (optional: download first few bytes to check content type)
        try {
            const response = await axios.get(imageUrl, { httpsAgent: agent, responseType: 'stream', timeout: 10000 });
            const contentType = response.headers['content-type'];
            if (!contentType || !contentType.startsWith('image/')) {
                return sock.sendMessage(from, { text: '❌ URL does not point to a valid image.' });
            }
            // Success – store the URL globally
            global.menuImageUrl = imageUrl;
            await sock.sendMessage(from, { text: `✅ Menu image updated to:\n${imageUrl}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼` });
        } catch (err) {
            console.error('Image validation error:', err);
            await sock.sendMessage(from, { text: `❌ Failed to validate image URL: ${err.message}` });
        }
    }
};
