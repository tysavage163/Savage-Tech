const { exec } = require('child_process');

module.exports = {
    name: 'update',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // 🆔 IDENTITY CHECK
        const supremeDeveloper = '254798841125@s.whatsapp.net';
        const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBoss = (sender === supremeDeveloper || sender === localOwner || msg.key.fromMe);

        if (!isBoss) {
            return sock.sendMessage(from, { text: "❌ *Access Denied.* Only the Architect can authorize a Neural Upgrade." });
        }

        // ⚡ POWER-UP QUOTES
        const upgradeQuotes = [
            "🌀 *Neural pathways expanding... The evolution is inevitable.*",
            "⚡ *Power levels surging. Initiating core code overwrite.*",
            "🛡️ *Optimizing combat protocols... A superior version is manifesting.*",
            "🌌 *Breaking limits. The system is transcending its current form.*"
        ];
        const randomQuote = upgradeQuotes[Math.floor(Math.random() * upgradeQuotes.length)];

        await sock.sendMessage(from, { text: `🛰️ *SAVAGE-TECH UPGRADE:*\n\n"${randomQuote}"\n\n> Fetching updates from GitHub...` });

        // 🛠️ EXECUTE GIT PULL
        exec('git pull', (err, stdout, stderr) => {
            if (err) {
                return sock.sendMessage(from, { text: `❌ *Upgrade Failed:* ${err.message}` });
            }
            
            if (stdout.includes('Already up to date.')) {
                return sock.sendMessage(from, { text: "💎 *System Perfection:* No updates found. The current version is already at its peak." });
            }

            const successMessage = `
┎──────────────────────────╼
┃   🔥 𝐒𝐘𝐒𝐓𝐄𝐌 𝐔𝐏𝐆𝐑𝐀𝐃𝐄𝐃 🔥  
┖──────────────────────────╼
┃
┃ 🟢 *EVOLUTION:* COMPLETE
┃ 🧬 *MODIFICATIONS:* ┃ ${stdout}
┃
┃ ⚠️ *NOTICE:* Rebooting to integrate 
┃ new power levels...
┖──────────────────────────╼
`;

            sock.sendMessage(from, { text: successMessage });

            // 🔄 AUTO-RESTART 
            // Bot shuts down to apply the "Major Power Up"
            setTimeout(() => {
                process.exit();
            }, 3000);
        });
    }
};
