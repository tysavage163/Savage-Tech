const os = require('os');

module.exports = {
    name: 'menu',
    category: 'main',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const pushName = msg.pushName || "User";

        // --- SYSTEM CALCULATIONS ---
        const uptimeSeconds = process.uptime();
        const uptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m`;
        
        const usedMem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const hostName = os.hostname();

        // --- COMMAND LOADER ---
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
║ 💻 *HOST:* ${hostName} (Termux)
╠══════════════════════╗
║     *AVAILABLE CMDs* ╠══════════════════════╝
${formattedCommands}
╚══════════════════════╝

_“Evolution is mandatory.”_`;

        await sock.sendMessage(from, { 
            text: menuText,
            mentions: [sender],
            contextInfo: {
                externalAdReply: {
                    title: "SAVAGE-TECH ONLINE",
                    body: "System Dashboard",
                    mediaType: 1,
                    thumbnailUrl: "https://github.com/tysavage163.png",
                    sourceUrl: "https://github.com/tysavage163/Savage-Tech"
                }
            }
        }, { quoted: msg });
    }
};
