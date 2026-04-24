module.exports = {
    name: "pair",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Simple response to test if the command is alive
        const responseText = `
╔════════════════════════╗
   ⚡ *SYSTEM DIAGNOSTIC* ⚡
╠════════════════════════╣
║
║ 💠 *CMD:* PAIR
║ 🧬 *STATUS:* ACTIVE
║ 🛡️ *RANK:* ARCHITECT
║
╚════════════════════════╝
_Neural logic is initialized._
        `.trim();

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });
    }
};
