const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    name: 'sticker',
    async execute(sock, m, args) {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
        const type = quoted ? Object.keys(quoted)[0] : Object.keys(m.message)[0];
        
        if (type === 'imageMessage' || type === 'videoMessage') {
            const message = quoted ? quoted[type] : m.message[type];
            const stream = await downloadContentFromMessage(message, type.replace('Message', ''));
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            
            await sock.sendMessage(m.key.remoteJid, { sticker: buffer }, { quoted: m });
        } else {
            await sock.sendMessage(m.key.remoteJid, { text: '❌ Please reply to an image or video with !sticker' });
        }
    }
};
