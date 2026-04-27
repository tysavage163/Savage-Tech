module.exports = {
    name: "steal",
    category: "tools",
    async execute(sock, msg) {
        const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        if (!quoted) return;
        
        await sock.sendMessage(msg.key.remoteJid, { 
            sticker: { url: quoted.url || quoted.directPath } 
        }, { quoted: msg });
    }
};
