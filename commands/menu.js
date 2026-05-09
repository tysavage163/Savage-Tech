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
                return `┌───¤  * ${title} *\n${filtered.map(cmd => `┃  ♤ .${cmd.name}`).join('\n')}\n┕━━━━━━━━━━━━━━━╼\n\n`;
            };

            const senderName = msg.pushName || 'User';
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const mention = [senderJid];

            const header = `┌───¤  *SΛVΛGΞ-TECH*
┃
┃ **DEVELOPER** : Spencer
┃ **USER** : @${senderName}
┃ **PREFIX** : [ ${global.prefix} ]
┃ **UPTIME** : ${hours}h ${minutes}m
┃ **SPEED** : ${speed} ms
┃ **RAM** : [${ramBar}] ${ramPercentage}%
┃
┕━━━━━━━━━━━━━━━╼\n\n`;

            const ownerMenu = getCategorizedMenu('owner', 'OWNER MENU');
            const groupMenu = getCategorizedMenu('group', 'GROUP MENU');
            const aiMenu = getCategorizedMenu('ai', 'AI MODULES');
            const funMenu = getCategorizedMenu('fun', 'FUN & GAMES');
            const toolsMenu = getCategorizedMenu('tools', 'TOOLS MENU');
            const downloadMenu = getCategorizedMenu('download', 'DOWNLOAD MENU');
            const audioMenu = getCategorizedMenu('audio', 'AUDIO MENU');
            const engineMenu = getCategorizedMenu('engine', 'ENGINE MENU');
            const audioEffectsMenu = getCategorizedMenu('Audio Effects', 'AUDIO EFFECTS MENU');
            const spotifyMenu = getCategorizedMenu('Audio', 'SPOTIFY MENU');
            const financialMenu = getCategorizedMenu('financial data', 'FINANCIAL DATA');
            const searchMenu = getCategorizedMenu('search menu', 'SEARCH MENU');
            const animeMenu = getCategorizedMenu('anime', 'ANIME MENU');
            const ethicalMenu = getCategorizedMenu('ethical hacking', 'ETHICAL HACKING');
            const sportsMenu = getCategorizedMenu('sports', 'SPORTS MENU');

            const definedCats = ['owner', 'group', 'ai', 'fun', 'tools', 'download', 'audio', 'engine', 'Audio Effects', 'Audio', 'financial data', 'search menu', 'anime', 'ethical hacking', 'sports'];

            const otherMenu = Array.from(global.commands.values())
                .filter(cmd => !definedCats.includes(cmd.category))
                .length > 0 ? getCategorizedMenu(Array.from(global.commands.values()).find(c => !definedCats.includes(c.category)).category, 'OTHER MODULES') : "";

            const footer = `_master your tools or be mastered by them_`;

            const fullMenu = header + ownerMenu + groupMenu + aiMenu + funMenu + toolsMenu + downloadMenu + audioMenu + audioEffectsMenu + spotifyMenu + financialMenu + searchMenu + animeMenu + ethicalMenu + sportsMenu + engineMenu + otherMenu + footer;

            // If a custom menu image is set, use it; otherwise send text only
            if (global.menuImageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: global.menuImageUrl }, 
                    caption: fullMenu,
                    mentions: mention
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { 
                    text: fullMenu,
                    mentions: mention
                }, { quoted: msg });
            }
        } catch (error) {
            console.error("MENU ERROR:", error);
            await sock.sendMessage(from, { text: "❌ **SΛVΛGΞ:** DATA FETCH FAILED" });
        }
    }
};
