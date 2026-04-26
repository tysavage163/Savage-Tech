const os = require('os');

module.exports = {
    name: 'menu',
    category: 'engine',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        
        try {
            const uptimeSeconds = process.uptime();
            const hours = Math.floor(uptimeSeconds / 3600);
            const minutes = Math.floor((uptimeSeconds % 3600) / 60);
            const speed = ((Date.now() - msg.messageTimestamp * 1000) / 1000).toFixed(4);
            
            const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
            const usedMem = ((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0);
            const ramPercentage = Math.floor((usedMem / totalMem) * 100);
            const ramBar = "█".repeat(Math.floor(ramPercentage / 10)) + "░".repeat(Math.floor(10 - (ramPercentage / 10)));

            const getCategorizedMenu = (catName, title) => {
                const filtered = Array.from(global.commands.values())
                    .filter(cmd => cmd.category === catName)
                    .sort((a, b) => (a.order || 99) - (b.order || 99));

                if (filtered.length === 0) return ""; 

                return `┌───◇  * ${title} *\n${filtered.map(cmd => `┃  ➥ .${cmd.name}`).join('\n')}\n┕━━━━━━━━━━━━━━━╼\n\n`;
            };

            const header = `┌───◇  *SΛVΛGΞ-TECH*
┃
┃ **OWNER** : Spencer
┃ **PREFIX** : [ ${global.prefix} ]
┃ **UPTIME** : ${hours}h ${minutes}m
┃ **SPEED** : ${speed} ms
┃ **RAM** : [${ramBar}] ${ramPercentage}%
┃
┕━━━━━━━━━━━━━━━╼\n\n`;

            const ownerMenu = getCategorizedMenu('owner', 'OWNER MENU');
            const groupMenu = getCategorizedMenu('group', 'GROUP MENU');
            const aiMenu = getCategorizedMenu('ai', 'AI MENU');
            const toolsMenu = getCategorizedMenu('tools', 'TOOLS MENU');
            const audioMenu = getCategorizedMenu('audio', 'AUDIO MENU');
            const engineMenu = getCategorizedMenu('engine', 'ENGINE MENU');

            const footer = `_Master your tools or be deleted._`;
            const fullMenu = header + ownerMenu + groupMenu + aiMenu + toolsMenu + audioMenu + engineMenu + footer;

            const menuImage = 'https://i.ibb.co/QF1KM5Bp/IMG-20260425-WA1076.webp';

            await sock.sendMessage(from, { 
                image: { url: menuImage }, 
                caption: fullMenu,
                mentions: [msg.key.participant || from]
            });

        } catch (error) {
            console.error("MENU ERROR:", error);
            await sock.sendMessage(from, { text: "┌───◇  *SΛVΛGΞ: ERROR*\n┃\n┃ **STATUS** : DATA FETCH FAILED 💀\n┕━━━━━━━━━━━━━━━╼" });
        }
    }
};
