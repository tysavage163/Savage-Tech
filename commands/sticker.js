const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('easy-whatsapp-sticker');

module.exports = {
    category: 'tools',
    name: 'sticker',
    async execute(sock, m, args) {
        try {
            const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const type = quoted ? Object.keys(quoted)[0] : Object.keys(m.message)[0];
            
            if (type === 'imageMessage' || type === 'videoMessage') {
                const message = quoted ? quoted[type] : m.message[type];
                
                // Signal that the engine is processing
                await sock.sendMessage(m.key.remoteJid, { text: '⚙️ *GENERATING STICKER...*' }, { quoted: m });

                const stream = await downloadContentFromMessage(message, type.replace('Message', ''));
                let buffer = Buffer.from([]);
                for await (const chunk of stream) {
                    buffer = Buffer.concat([buffer, chunk]);
                }
                
                // Use easy-whatsapp-sticker to format the buffer correctly
                const sticker = new Sticker(buffer, {
                    pack: 'SΛVΛGΞ-TECH', 
                    author: 'Beck',
                    type: StickerTypes.FULL, 
                    categories: ['🤩', '⚙️'],
                    id: '12345',
                    quality: 50, // Lower quality slightly for faster Termux processing
                });

                const stickerBuffer = await sticker.toBuffer();
                await sock.sendMessage(m.key.remoteJid, { sticker: stickerBuffer }, { quoted: m });
            } else {
                await sock.sendMessage(m.key.remoteJid, { text: '☣️ *SYSTEM ERROR:* Please reply to an image or video with .sticker' });
            }
        } catch (error) {
            console.error(error);
            await sock.sendMessage(m.key.remoteJid, { text: '❌ *RECOVERY FAILED:* Could not process media.' });
        }
    }
};
