const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEFAULT_IMAGES = [
    'https://files.catbox.moe/osd79e.jpg'
];

function getHostPlatform() {
    if (process.env.DYNO) return 'Heroku (Dyno)';
    if (process.env.RENDER) return 'Render';
    if (process.env.VERCEL) return 'Vercel';
    if (process.env.KOYEB) return 'Koyeb';
    if (process.env.RAILWAY_ENVIRONMENT) return 'Railway';
    if (process.env.REPLIT_DB_URL) return 'Replit';
    if (process.env.COOLIFY) return 'Coolify';
    if (os.platform() === 'android' && process.env.PREFIX === '/data/data/com.termux/usr') return 'Termux (Android)';
    if (os.platform() === 'linux') return 'Linux VPS';
    if (os.platform() === 'win32') return 'Windows';
    if (os.platform() === 'darwin') return 'macOS';
    return 'Unknown / Local';
}

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
            const ramBar = "█".repeat(Math.floor(ramPercentage / 10)) + "░".repeat(10 - Math.floor(ramPercentage / 10));

            const getCategorizedMenu = (catName, title) => {
                const filtered = Array.from(global.commands.values())
                    .filter(cmd => cmd.category === catName);
                if (filtered.length === 0) return ""; 
                return `┌───¤  * ${title} *\n${filtered.map(cmd => `┃  ♤ ${cmd.name}`).join('\n')}\n┕━━━━━━━━━━━━━━━╼\n\n`;
            };

            const senderName = msg.pushName || 'User';
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const mention = [senderJid];
            
            let version = '1.0.0';
            let commitCount = 0;
            try {
                commitCount = parseInt(execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim());
                const minor = Math.floor(commitCount / 10);
                const patch = commitCount % 10;
                version = `1.${minor}.${patch}`;
            } catch (e) {
                try {
                    const pkgPath = path.join(__dirname, '..', 'package.json');
                    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
                    version = pkg.version;
                } catch (err) {}
            }
            
            const mode = global.worktype === 'public' ? '🌍 PUBLIC' : '🔒 PRIVATE';
            const host = getHostPlatform();

            const header = `┌───¤  *SΛVΛGΞ-TECH*
┃
┃ DEVELOPER : Spencer
┃ USER : @${senderJid.split('@')[0]}
┃ PREFIX : [ ${global.prefix} ]
┃ UPTIME : ${hours}h ${minutes}m
┃ SPEED : ${speed} ms
┃ RAM : [${ramBar}] ${ramPercentage}%
┃ MODE : ${mode}
┃ VERSION : ${version}
┃ HOST : ${host}
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
            const mediaMenu = getCategorizedMenu('media', '🎬 MOVIES & TV SHOWS');
            const foodMenu = getCategorizedMenu('food', '🍽️ FOOD & DRINKS');

            const definedCats = ['owner', 'group', 'ai', 'fun', 'tools', 'download', 'audio', 'engine', 'Audio Effects', 'Audio', 'financial data', 'search menu', 'anime', 'ethical hacking', 'sports', 'media', 'food'];

            const otherMenu = Array.from(global.commands.values())
                .filter(cmd => !definedCats.includes(cmd.category))
                .length > 0 ? getCategorizedMenu(Array.from(global.commands.values()).find(c => !definedCats.includes(c.category)).category, 'OTHER MODULES') : "";

            const footer = `> The future belongs to the ones crazy enough to build it.`;
            const fullMenu = header + ownerMenu + groupMenu + aiMenu + funMenu + toolsMenu + downloadMenu + audioMenu + audioEffectsMenu + spotifyMenu + financialMenu + searchMenu + animeMenu + ethicalMenu + sportsMenu + engineMenu + mediaMenu + foodMenu + otherMenu + footer;

            let imageUrl = null;
            if (global.menuImages && global.menuImages.length > 0) {
                if (typeof global.menuImageIndex !== 'number') global.menuImageIndex = 0;
                imageUrl = global.menuImages[global.menuImageIndex];
                global.menuImageIndex = (global.menuImageIndex + 1) % global.menuImages.length;
            } else if (global.menuImageUrl) {
                imageUrl = global.menuImageUrl;
            } else {
                if (!global.menuImages && !global.menuImageUrl) {
                    global.menuImages = [...DEFAULT_IMAGES];
                    global.menuImageIndex = 0;
                }
                imageUrl = global.menuImages[global.menuImageIndex];
                global.menuImageIndex = (global.menuImageIndex + 1) % global.menuImages.length;
            }

            if (imageUrl) {
                await sock.sendMessage(from, { 
                    image: { url: imageUrl }, 
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
