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
        const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);

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
║ 📟 *RAM:* ${usedMem}MB / ${totalMem}GB
╚══════════════════════╝

╠═══ *AVAILABLE COMMANDS* ═══╗
${formattedCommands}
╚════════════════════════════╝`;

        await sock.sendMessage(from, { 
            text: menuText,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "SAVAGE-TECH MAIN MENU",
                    body: "Status: Online & Optimized",
                    mediaType: 1,
                    renderLargerThumbnail: true, 
                    // Using your new direct image link
                    thumbnailUrl: "https://i.ibb.co/fGqCfSQx/IMG-20260424-WA0110.webp", 
                    sourceUrl: "https://github.com/tysavage163/Savage-Tech"
                }
            }
        }, { quoted: msg });
    }
};
