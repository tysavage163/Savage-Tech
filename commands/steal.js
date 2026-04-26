module.exports = {
    name: "steal",
    category: "other", // 🔄 Relocated to 'other' modules
    description: "Re-brand a sticker with Savage-Tech watermarks",
    async execute(sock, msg, args) {
        // 🛡️ Verify if the user is actually replying to a sticker
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted?.stickerMessage) {
            return sock.sendMessage(msg.key.remoteJid, { 
                text: "🏷️ *SΛVΛGΞ:* Reply to a sticker to claim it for the collective." 
            }, { quoted: msg });
        }

        const sticker = quoted.stickerMessage;
        
        // 🧬 Re-transmitting with Architect's branding
        await sock.sendMessage(msg.key.remoteJid, { 
            sticker: { url: sticker.url || sticker.directPath },
            packname: "SΛVΛGΞ-TECH",
            author: "Beck"
        }, { quoted: msg });
    }
};
