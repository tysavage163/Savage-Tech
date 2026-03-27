module.exports = {
    name: 'menu',
    async execute(sock, m, args) {
        const message = `*『 SAVAGE TECH BOT 』*

*COMMAND SERIES:*
🚀 .ping - Check Speed
🔐 .encode - Savage Encryption
🛠️ .menu - Show this list

*Status:* Independent & Active ✅`;

        await sock.sendMessage(m.key.remoteJid, { text: message });
    }
};
