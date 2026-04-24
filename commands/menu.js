const os = require('os');

module.exports = {
    name: 'menu',
    category: 'main',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        try {
            // 1. DYNAMIC SYSTEM CALCULATIONS
            const uptimeSeconds = process.uptime();
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
            const ramPercentage = Math.floor((usedMem / totalMem) * 100);
            const ramBar = "█".repeat(Math.floor(ramPercentage / 10)) + "░".repeat(Math.floor(10 - (ramPercentage / 10)));

            // 2. CIPHER-X ORGANIZED BODY
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

            // 3. YOUR SPECIFIC IMAGE LINK
            const menuImage = 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/0c780413-5837-4d2c-bc94-5c91851e7a93.png';

            await sock.sendMessage(from, { 
                image: { url: menuImage }, 
                caption: menuText,
                mentions: [msg.key.participant || from]
            }).catch(async (err) => {
                console.error("Image delivery failed, sending text fallback.");
                await sock.sendMessage(from, { text: menuText });
            });

        } catch (error) {
            console.error("CRITICAL MENU ERROR:", error);
        }
    }
};
