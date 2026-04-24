const os = require('os');

module.exports = {
    name: 'menu',
    category: 'main',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        // --- SYSTEM DATA ---
        const uptimeSeconds = process.uptime();
        const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;
        
        // RAM Calculations
        const usedMem = process.memoryUsage().rss; // Using RSS for total process memory
        const totalMem = os.totalmem();
        const usedPercentage = Math.min(Math.round((usedMem / totalMem) * 100), 100);
        
        // --- RAM BAR GENERATOR ---
        const barLength = 10;
        const filledLength = Math.round((usedPercentage / 100) * barLength);
        const bar = '■'.repeat(filledLength) + '□'.repeat(barLength - filledLength);

        // --- DYNAMIC COMMAND LIST ---
        const commandList = Array.from(global.commands.keys());
        const formattedCommands = commandList
            .map((cmd, index) => `  ║ ${index + 1}. ${global.prefix}${cmd}`)
            .join('\n');

        const menuText = `
╔══════════════════════╗
║     *SAVAGE-TECH V1* ╠══════════════════════╝
║ 👤 *USER:* @${sender.split("@")[0]}
║ 🛠️ *DEV:* Beck Spencer
║ ⌛ *UPTIME:* ${uptime}
║ 📟 *RAM:* [${bar}] ${usedPercentage}%
╚══════════════════════╝

╠═══ *AVAILABLE COMMANDS* ═══╗
${formattedCommands}
╚════════════════════════════╝

_Master your tools or be mastered by them._`;

        await sock.sendMessage(from, { 
            text: menuText,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "SAVAGE-TECH MAIN MENU",
                    body: "Status: Online & Optimized",
                    mediaType: 1,
                    renderLargerThumbnail: true, 
                    thumbnailUrl: "https://i.ibb.co/fGqCfSQx/IMG-20260424-WA0110.webp", 
                    sourceUrl: "https://github.com/tysavage163/Savage-Tech"
                }
            }
        }, { quoted: msg });
    }
};
