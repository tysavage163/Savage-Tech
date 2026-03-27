module.exports = {
    name: 'ping',
    description: 'Check if the bot is alive',
    async execute(sock, m) {
        await sock.sendMessage(m.key.remoteJid, { 
            text: 'Savage-Tech V1 is Online! ⚡' 
        }, { quoted: m });
    }
};
