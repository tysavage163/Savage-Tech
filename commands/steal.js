// Note: Requires 'wa-sticker-formatter' (npm install wa-sticker-formatter)
const { Sticker } = require('wa-sticker-formatter');

module.exports = {
    name: "steal",
    category: "other",
    async execute(sock, msg) {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return sock.sendMessage(msg.key.remoteJid, { text: "☣️ Quote a sticker to re-brand it." });

        const stream = await require('@whiskeysockets/baileys').downloadContentFromMessage(quoted, 'sticker');
        let buffer = Buffer.from([]);
        for await(const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }

        const sticker = new Sticker(buffer, {
            pack: 'SΛVΛGΞ-TECH',
            author: 'Beck',
            type: 'full',
            categories: ['🤩', '⚙️'],
            id: '12345',
            quality: 50,
        });

        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(msg.key.remoteJid, { sticker: stickerBuffer }, { quoted: msg });
    }
};
