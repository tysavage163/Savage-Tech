const { downloadMediaMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'setpp',
    category: 'owner',
    description: 'Update bot profile picture (reply to an image)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, { text: '❌ Owner only command.' });
        }
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted) {
            return sock.sendMessage(from, { text: '❌ Reply to an image message.' });
        }
        const imageMsg = quoted.imageMessage;
        if (!imageMsg) {
            return sock.sendMessage(from, { text: '❌ The replied message must be an image.' });
        }
        try {
            await sock.sendMessage(from, { text: '📸 Downloading image...' });
            const buffer = await downloadMediaMessage(
                { message: quoted },
                'buffer',
                {},
                { logger: console }
            );
            if (!buffer || buffer.length === 0) {
                throw new Error('Failed to download image');
            }
            await sock.updateProfilePicture(sock.user.id, buffer);
            await sock.sendMessage(from, { text: '✅ Digital identity updated.' });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` });
        }
    }
};
