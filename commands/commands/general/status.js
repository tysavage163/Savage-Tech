module.exports = {
    name: 'status',
    async execute(sock, m) {
        const status = `*『 SAVAGE TECH STATUS 』*\n\n` +
                       `✅ *System:* Online\n` +
                       `🚀 *Mode:* Independent Series\n` +
                       `📅 *Date:* ${new Date().toLocaleDateString()}\n\n` +
                       `_Savage Tech is ready for orders._`;
        await sock.sendMessage(m.key.remoteJid, { text: status });
    }
};
