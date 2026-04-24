const os = require('os');

module.exports = {
    name: 'menu',
    category: 'main',
    execute: async (sock, msg, args, { hasAccess }) => {
        const from = msg.key.remoteJid;
        
        try {
            // 1. CALCULATE REAL-TIME STATS
            const uptimeSeconds = process.uptime();
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
            const ramPercentage = Math.floor((usedMem / totalMem) * 100);
            const ramBar = "█".repeat(Math.floor(ramPercentage / 10)) + "░".repeat(Math.floor(10 - (ramPercentage / 10)));

            // 2. BUILD CIPHER-X BODY
            const menuText = `
┌──╼ ◈ *SΛVΛGΞ-TECH* ◈
│ *OWNER* : Savage
│ *USER* : @${global.architect.split("@")[0]}
│ *PREFIX* : [ ${global.prefix} ]
│ *UPTIME* : ${hours}h ${minutes}m
│ *USAGE* : ${usedMem} MB / ${totalMem} MB
│ *RAM* : [${ramBar}] ${ramPercentage}%
│ *PLUGINS* : ${global.commands.size}
└──────────────╼

┌──╼ ◈ *COMMAND LIST* ◈
${Array.from(global.commands.values()).map((cmd) => `│ ➥ ${cmd.name}`).join('\n')}
└──────────────╼

*Master your tools or be mastered by them.*`;

            // 3. SEND AS CLEAN IMAGE CAPTION
            await sock.sendMessage(from, { 
                image: { url: 'https://github.com/tysavage163/Savage-Tech/raw/main/assets/spencer.jpg' }, 
                caption: menuText,
                mentions: [msg.key.participant || from]
            });

        } catch (error) {
            console.error("MENU ERROR:", error);
            await sock.sendMessage(from, { text: "❌ Menu system encountered an internal error." });
        }
    }
};
