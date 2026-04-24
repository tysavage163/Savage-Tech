const os = require('os');

module.exports = {
    name: 'menu',
    category: 'main',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        // --- 1. DYNAMIC DATA CALCULATIONS ---
        const uptimeSeconds = process.uptime();
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        
        const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
        const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
        const ramPercentage = Math.floor((usedMem / totalMem) * 100);
        
        // High-density RAM bar
        const ramBar = "█".repeat(Math.floor(ramPercentage / 10)) + "░".repeat(Math.floor(10 - (ramPercentage / 10)));

        // --- 2. STRUCTURED MESSAGE BODY ---
        const menuText = `
┌──╼ ◈ *SΛVΛGΞ-TECH* ◈
│ *OWNER* : Savage
│ *USER* : @${global.architect.split("@")[0]}
│ *PREFIX* : [ ${global.prefix} ]
│ *UPTIME* : ${hours}h ${minutes}m
│ *USAGE* : ${usedMem} MB of ${totalMem} MB
│ *RAM* : [${ramBar}] ${ramPercentage}%
│ *COMMANDS* : ${global.commands.size}
└──────────────╼

┌──╼ ◈ *MAIN MENU* ◈
${Array.from(global.commands.values()).map((cmd) => `│ ➥ ${cmd.name}`).join('\n')}
└──────────────╼

*Master your tools or be mastered by them.*`;

        // --- 3. CLEAN FULL-IMAGE DELIVERY ---
        await sock.sendMessage(from, { 
            image: { url: 'https://github.com/tysavage163/Savage-Tech/raw/main/assets/spencer.jpg' }, 
            caption: menuText,
            mentions: [msg.key.participant || from]
        });
    }
};
