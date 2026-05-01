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

            // Original categories
            const ownerMenu = getCategorizedMenu('owner', 'OWNER MENU');
            const groupMenu = getCategorizedMenu('group', 'GROUP MENU');
            const aiMenu = getCategorizedMenu('ai', 'AI MODULES');
            const funMenu = getCategorizedMenu('fun', 'FUN & GAMES');
            const toolsMenu = getCategorizedMenu('tools', 'TOOLS MENU');
            const downloadMenu = getCategorizedMenu('download', 'DOWNLOAD MENU');
            const audioMenu = getCategorizedMenu('audio', 'AUDIO MENU');
            const engineMenu = getCategorizedMenu('engine', 'ENGINE MENU');

            // New categories
            const audioEffectsMenu = getCategorizedMenu('Audio Effects', 'AUDIO EFFECTS MENU');
            const spotifyMenu = getCategorizedMenu('Audio', 'SPOTIFY MENU');

            // Updated exclusion list (includes new categories)
            const definedCats = ['owner', 'group', 'ai', 'fun', 'tools', 'download', 'audio', 'engine', 'Audio Effects', 'Audio'];

            // Catch-all for other categories
            const otherMenu = Array.from(global.commands.values())
                .filter(cmd => !definedCats.includes(cmd.category))
                .length > 0 ? getCategorizedMenu(Array.from(global.commands.values()).find(c => !definedCats.includes(c.category)).category, 'OTHER MODULES') : "";

            const footer = `_Master your tools or be deleted._`;
            
            // Added new menus to the concatenation
            const fullMenu = header + ownerMenu + groupMenu + aiMenu + funMenu + toolsMenu + downloadMenu + audioMenu + audioEffectsMenu + spotifyMenu + engineMenu + otherMenu + footer;

            await sock.sendMessage(from, { 
                image: { url: 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/3672838c-1a31-4c1f-be38-9a080e3f8e1c.png' }, 
                caption: fullMenu,
                mentions: [msg.key.participant || from]
            }, { quoted: msg });

        } catch (error) {
            console.error("MENU ERROR:", error);
            await sock.sendMessage(from, { text: "❌ **SΛVΛGΞ:** DATA FETCH FAILED" });
        }
    }
};
