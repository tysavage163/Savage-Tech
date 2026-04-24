const { exec } = require("child_process");

module.exports = {
    name: "update",
    async execute(sock, msg, args, { hasAccess }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        // 🛡️ SECURITY GATE
        if (!hasAccess) {
            return sock.sendMessage(from, { 
                text: "🚫 *ACCESS DENIED:* Only the Architect or Host can trigger a system synchronization." 
            }, { quoted: msg });
        }

        // ⚡ POWER-UP QUOTES
        const quotes = [
            "“The limit of my language means the limit of my world.”",
            "“Evolution is a process, not an event.”",
            "“True power is the ability to redefine oneself.”",
            "“Breaking the shell to let the dragon fly.”"
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await sock.sendMessage(from, { text: "📡 *System:* Contacting core server... preparing for evolution." }, { quoted: msg });

        // ⚙️ EXECUTE GIT PULL
        exec("git pull", (err, stdout, stderr) => {
            if (err) {
                return sock.sendMessage(from, { text: `❌ *Update Failed:* ${err.message}` }, { quoted: msg });
            }

            // 📊 COOL UPGRADE BOX STRUCTURE
            const responseText = `
╔══════════════════════╗
       🧬 *SYSTEM EVOLUTION* 🧬
╠══════════════════════╣
║
║ 🟢 *CORE STATUS:* OPTIMIZED
║ 📡 *PROTOCOL:* SYNCED
║ 👤 *AUTHOR:* ARCHITECT
║
╠══════════════════════╣
   *“MAJOR UPGRADE INCOMING”*
   ${randomQuote}
╚══════════════════════╝
_Initiating reboot sequence..._
            `.trim();

            sock.sendMessage(from, { 
                text: responseText, 
                mentions: [sender] 
            }, { quoted: msg }).then(() => {
                // Kill process to trigger restart
                process.exit(); 
            });
        });
    }
};
