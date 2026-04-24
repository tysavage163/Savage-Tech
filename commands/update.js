const { exec } = require("child_process");

module.exports = {
    name: "update",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        await sock.sendMessage(from, { text: "🧬 *SYSTEM:* Initiating evolutionary rewrite..." });

        // Force the sync from your Savage-Tech repo
        exec("git fetch --all && git reset --hard origin/main", (err, stdout, stderr) => {
            if (err) {
                return sock.sendMessage(from, { text: `❌ *EVOLUTION ABORTED:* ${err.message}` });
            }

            const evolutionMsg = `
╔════════════════════════╗
     🧬 *EVOLUTION COMPLETE* 🧬
╠════════════════════════╣
║
║ 🛰️ *GRID:* Synced & Optimized
║ 🦾 *STATUS:* Stronger than before
║ 🛡️ *LEVEL:* Sovereign Architect
║
╚════════════════════════╝
_I have evolved. Rebooting to 
apply my new strength..._
            `.trim();

            sock.sendMessage(from, { text: evolutionMsg }).then(() => {
                // Kill process to reload fresh code
                process.exit();
            });
        });
    }
};
