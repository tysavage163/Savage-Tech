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

            // Categories to display in order
            const categories = [
                { name: 'owner', title: 'OWNER MENU' },
                { name: 'group', title: 'GROUP MENU' },
                { name: 'ai', title: 'AI MODULES' },
                { name: 'fun', title: 'FUN & GAMES' },
                { name: 'tools', title: 'TOOLS MENU' },
                { name: 'audio', title: 'AUDIO MENU' },
                { name: 'engine', title: 'ENGINE MENU' }
            ];

            let fullMenu = header;
            const definedCatNames = categories.map(c => c.name);

            // Add all defined categories
            for (const cat of categories) {
                fullMenu += getCategorizedMenu(cat.name, cat.title);
            }

            // Catch-all for any other categories (e.g., uncategorized)
            const otherCommands = Array.from(global.commands.values())
                .filter(cmd => !definedCatNames.includes(cmd.category));
            
            if (otherCommands.length > 0) {
                // Group by their actual category name
                const otherGroups = new Map();
                for (const cmd of otherCommands) {
                    if (!otherGroups.has(cmd.category)) otherGroups.set(cmd.category, []);
                    otherGroups.get(cmd.category).push(cmd);
                }
                for (const [catName, cmds] of otherGroups.entries()) {
                    const title = `${catName.toUpperCase()} MODULES`;
                    fullMenu += `┌───◇  * ${title} *\n${cmds.map(cmd => `┃  ➥ .${cmd.name}`).join('\n')}\n┕━━━━━━━━━━━━━━━╼\n\n`;
                }
            }

            const footer = `_Master your tools or be deleted._`;
            fullMenu += footer;

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
