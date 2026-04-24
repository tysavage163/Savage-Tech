const os = require('os');
const fs = require('fs');

module.exports = {
    name: 'menu',
    category: 'main',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        // 1. SET YOUR PERMANENT DEFAULT
        const defaultImg = "https://i.ibb.co/SHBMxn1/IMG-20260424-WA0110.webp";
        let currentImg = defaultImg;

        // 2. CHECK FOR TEMPORARY IMAGE & 24-HOUR EXPIRY
        const dbPath = './menu_settings.json';
        if (fs.existsSync(dbPath)) {
            let settings = JSON.parse(fs.readFileSync(dbPath));
            const now = Date.now();
            const twentyFourHours = 24 * 60 * 60 * 1000;

            if (now - settings.timeSet > twentyFourHours) {
                // Time expired! Revert to default and delete the temp file
                fs.unlinkSync(dbPath);
            } else {
                // Time hasn't expired, use the custom image
                currentImg = settings.customImg;
            }
        }

        // --- SYSTEM CALCULATIONS ---
        const uptimeSeconds = process.uptime();
        const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;
        const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const usedPercentage = Math.min(Math.round((process.memoryUsage().rss / os.totalmem()) * 100), 100);
        
        const barLength = 10;
        const filledLength = Math.round((usedPercentage / 100) * barLength);
        const bar = '■'.repeat(filledLength) + '□'.repeat(barLength - filledLength);

        const commandList = Array.from(global.commands.keys());
        const formattedCommands = commandList.map((cmd, i) => `  ║ ${i + 1}. ${global.prefix}${cmd}`).join('\n');

        const menuText = `╔══════════════════════╗\n║     *SAVAGE-TECH V1* ╠══════════════════════╝\n║ 👤 *USER:* @${sender.split("@")[0]}\n║ ⌛ *UPTIME:* ${uptime}\n║ 📟 *RAM:* [${bar}] ${usedPercentage}%\n╚══════════════════════╝\n\n╠═══ *AVAILABLE COMMANDS* ═══╗\n${formattedCommands}\n╚════════════════════════════╝\n\n_Master your tools or be mastered by them._`;

        await sock.sendMessage(from, { 
            text: menuText,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "SΛVΛGΞ-TΞCH",
                    body: "Internal System",
                    mediaType: 1,
                    renderLargerThumbnail: true, 
                    thumbnailUrl: currentImg, 
                    sourceUrl: "" 
                }
            }
        }, { quoted: msg });
    }
};
