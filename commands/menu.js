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
            const financialMenu = getCategorizedMenu('financial data', 'FINANCIAL DATA');
            const searchMenu = getCategorizedMenu('search menu', 'SEARCH MENU');
            const animeMenu = getCategorizedMenu('anime', 'ANIME MENU');
            const ethicalMenu = getCategorizedMenu('ethical hacking', 'ETHICAL HACKING');

            // Updated exclusion list (includes new categories)
            const definedCats = ['owner', 'group', 'ai', 'fun', 'tools', 'download', 'audio', 'engine', 'Audio Effects', 'Audio', 'financial data', 'search menu', 'anime', 'ethical hacking'];

            // Catch-all for other categories
            const otherMenu = Array.from(global.commands.values())
                .filter(cmd => !definedCats.includes(cmd.category))
                .length > 0 ? getCategorizedMenu(Array.from(global.commands.values()).find(c => !definedCats.includes(c.category)).category, 'OTHER MODULES') : "";

            // Updated footer text
            const footer = `_master your tools or be mastered by them_`;
            
            // Added new menus to the concatenation
            const fullMenu = header + ownerMenu + groupMenu + aiMenu + funMenu + toolsMenu + downloadMenu + audioMenu + audioEffectsMenu + spotifyMenu + financialMenu + searchMenu + animeMenu + ethicalMenu + engineMenu + otherMenu + footer;

            await sock.sendMessage(from, { 
                image: { url: 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/775997ad-981a-4f09-a861-a18b6cb6888d.png' }, 
                caption: fullMenu,
                mentions: [msg.key.participant || from]
            }, { quoted: msg });

        } catch (error) {
            console.error("MENU ERROR:", error);
            await sock.sendMessage(from, { text: "❌ **SΛVΛGΞ:** DATA FETCH FAILED" });
        }
    }
};
