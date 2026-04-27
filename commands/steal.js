const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('easy-whatsapp-sticker');

module.exports = {
    name: "steal",
    category: "tools", // Moved from 'other' to 'tools'
    description: "Re-brand a sticker with SΛVΛGΞ-TECH watermarks",
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;

        if (!quoted) {
            return sock.sendMessage(from, { text: "🏷️ *SΛVΛGΞ:* Reply to a sticker to claim it for the collective." }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, { text: "⚙️ *RE-BRANDING IN PROGRESS...*" }, { quoted: msg });

            const stream = await downloadContentFromMessage(quoted, 'sticker');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            const sticker = new Sticker(buffer, {
                pack: 'SΛVΛGΞ-TECH',
                author: 'Beck',
                type: StickerTypes.FULL,
                quality: 60
            });

            const stickerBuffer = await sticker.toBuffer();
            await sock.sendMessage(from, { sticker: stickerBuffer }, { quoted: msg });

        } catch (e) {
            console.error(e);
            await sock.sendMessage(from, { text: "❌ *STEAL FAILED:* The engine could not re-process this sticker." });
        }
    }
};
