const os = require('os');

module.exports = {
    name: 'menu',
    category: 'engine',
    execute: async (sock, msg, args, { isMe }) => {
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
                    .filter(cmd => cmd.category === catName);
                if (filtered.length === 0) return ""; 
                return `┌───◇  * ${title} *\n${filtered.map(cmd => `┃  ➥ .${cmd.name}`).join('\n')}\n┕━━━━━━━━━━━━━━━╼\n\n`;
            };

            const header = `┌───◇  *SΛVΛGΞ-TECH*
┃
┃ **STATUS** : ${isMe ? 'MASTER RECOGNIZED 👑' : 'USER CONNECTED 👤'}
┃ **PREFIX** : [ ${global.prefix} ]
┃ **UPTIME** : ${hours}h ${minutes}m
┃ **SPEED** : ${speed} ms
┃ **RAM** : [${ramBar}] ${ramPercentage}%
┃
┕━━━━━━━━━━━━━━━╼\n\n`;

            // Maintain specified categories
            const ownerMenu = getCategorizedMenu('owner', 'OWNER MENU');
            const groupMenu = getCategorizedMenu('group', 'GROUP MENU');
            const aiMenu = getCategorizedMenu('ai', 'AI MENU');
            const toolsMenu = getCategorizedMenu('tools', 'TOOLS MENU');
            const audioMenu = getCategorizedMenu('audio', 'AUDIO MENU');
            const engineMenu = getCategorizedMenu('engine', 'ENGINE MENU');

            // Catch-all for other categories
            const otherMenu = Array.from(global.commands.values())
                .filter(cmd => !['owner', 'group', 'ai', 'tools', 'audio', 'engine'].includes(cmd.category))
                .length > 0 ? getCategorizedMenu(Array.from(global.commands.values()).find(c => !['owner', 'group', 'ai', 'tools', 'audio', 'engine'].includes(c.category)).category, 'OTHER MODULES') : "";

            const footer = `_Master your tools or be deleted._`;
            const fullMenu = header + ownerMenu + groupMenu + aiMenu + toolsMenu + audioMenu + engineMenu + otherMenu + footer;

            await sock.sendMessage(from, { 
                image: { url: 'https://i.ibb.co/QF1KM5Bp/IMG-20260425-WA1076.webp' }, 
                caption: fullMenu,
                mentions: [msg.key.participant || from]
            }, { quoted: msg });

        } catch (error) {
            console.error("MENU ERROR:", error);
            await sock.sendMessage(from, { text: "❌ **SΛVΛGΞ:** DATA FETCH FAILED" });
        }
    }
};
