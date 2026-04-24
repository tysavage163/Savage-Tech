module.exports = {
    name: "menu",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const pushName = msg.pushName || "User";
        const userJid = msg.key.participant || msg.key.remoteJid;

        // 🔍 This line is the "Brain" - it finds EVERY command loaded in the bot
        const commands = Array.from(global.commands.keys());
        
        // Structure the dynamic list
        const commandList = commands.map(cmd => `║ 💠 ${global.prefix}${cmd}`).join('\n');

        const menuText = `
╔════════════════════════╗
     ⚡ *SAVAGE TECH V3* ⚡
╠════════════════════════╣
║
║  👤 *USER:* @${userJid.split('@')[0]}
║  🛰️ *RANK:* OPERATIVE
║
╠════════════════════════╣
║      *COMMAND LIST* ║
╠════════════════════════╣
${commandList}
║
╚════════════════════════╝
   *TOTAL:* ${commands.length} COMMANDS
`.trim();

        // Send with the image you like
        await sock.sendMessage(from, { 
            image: { url: "https://files.catbox.moe/5m3l3q.jpg" }, // Use your specific image link here
            caption: menuText,
            mentions: [userJid]
        }, { quoted: msg });
    }
};
