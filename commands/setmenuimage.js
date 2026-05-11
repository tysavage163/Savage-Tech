module.exports = {
    name: 'setmenuimage',
    category: 'owner',
    description: 'Set one or more menu images (space‑separated URLs). They will rotate with .menu',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });

        if (args.length === 0) {
            return sock.sendMessage(from, { text: '❓ Usage: .setmenuimage <url1> [url2] [url3] [url4]\nExample: .setmenuimage https://files.catbox.moe/waffn1.png https://files.catbox.moe/abc.png' });
        }

        const validUrls = [];
        for (const url of args) {
            if (url.startsWith('http://') || url.startsWith('https://')) {
                validUrls.push(url);
            } else {
                return sock.sendMessage(from, { text: `❌ Invalid URL: ${url}\nUse direct image links starting with http:// or https://` });
            }
        }

        if (validUrls.length === 0) return;

        global.menuImages = validUrls;
        global.menuImageIndex = 0;
        delete global.menuImageUrl;

        const count = validUrls.length;
        const confirmText = `✅ Menu image${count > 1 ? 's' : ''} set (${count} total).\n${count > 1 ? 'Images will rotate each time you use .menu' : 'Single image set'}\n\nFirst image:\n${validUrls[0]}`;
        await sock.sendMessage(from, { text: confirmText });
    }
};
