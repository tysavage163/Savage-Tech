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
            const speed = ((Date.now() - msg.messageTimestamp * 1000) / 1000).toFixed(4);
            
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
            const ramPercentage = Math.floor((usedMem / totalMem) * 100);
            const ramBar = "█".repeat(Math.floor(ramPercentage / 10)) + "░".repeat(Math.floor(10 - (ramPercentage / 10)));

            // 2. SELF-UPDATING COMMAND SORTER
            // This pulls every command in global.commands and groups them
            const getCategorizedMenu = (catName, title) => {
                const filtered = Array.from(global.commands.values())
                    .filter(cmd => cmd.category === catName)
                    .sort((a, b) => (a.order || 99) - (b.order || 99)); // Manual arrangement logic

                if (filtered.length === 0) return ""; // Don't show empty categories

                return `┌───◇  **${title}**\n${filtered.map(cmd => `┃  ➥ ${cmd.name}`).join('\n')}\n┕━━━━━━━━━━━━━━━╼\n\n`;
            };

            const header = `┌───◇  **SΛVΛGΞ-TECH**
┃
┃ **OWNER** : Savage Architect
┃ **PREFIX** : [ ${global.prefix} ]
┃ **PLUGINS** : ${global.commands.size}
┃ **UPTIME** : ${hours}h ${minutes}m
┃ **SPEED** : ${speed} ms
┃ **RAM** : [${ramBar}] ${ramPercentage}%
┃
┕━━━━━━━━━━━━━━━╼\n\n`;

            const ownerMenu = getCategorizedMenu('owner', 'OWNER MENU');
            const adminMenu = getCategorizedMenu('admin', 'ADMIN MENU');
            const engineMenu = getCategorizedMenu('engine', 'ENGINE MENU');
            const mainMenu = getCategorizedMenu('main', 'MAIN MENU');

            const footer = `*Master your tools or be deleted.*`;
            const fullMenu = header + ownerMenu + adminMenu + engineMenu + mainMenu + footer;

            // 3. YOUR SPECIFIC IMAGE LINK
            const menuImage = 'https://i.ibb.co/5WJmsXjT/abedeb26fb62e27cd2fbb1292134ea1c.webp';

            await sock.sendMessage(from, { 
                image: { url: menuImage }, 
                caption: fullMenu,
                mentions: [msg.key.participant || from]
            });

        } catch (error) {
            console.error("CRITICAL MENU ERROR:", error);
            await sock.sendMessage(from, { text: "⚠️ System Error: Menu protocol failed." });
        }
    }
};
