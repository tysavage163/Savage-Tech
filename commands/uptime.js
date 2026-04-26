module.exports = {
    category: 'engine',
    name: "uptime",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Calculate time from seconds
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (24 * 60 * 60));
        const hours = Math.floor((uptimeSeconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((uptimeSeconds % (60 * 60)) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        // Savage Design
        const uptimeText = `
┏━━━━ ✨ *SYSTEM UPTIME* ✨ ━━━━┓
┃
┃ ❄️ *Status:* Online & Savage
┃ ⏱️ *Duration:* ┃    ▢ ${days} Days
┃    ▢ ${hours} Hours
┃    ▢ ${minutes} Minutes
┃    ▢ ${seconds} Seconds
┃
┃ 📶 *Speed:* Faster than your brain
┃ 🛠️ *Stability:* 100%
┃
┗━━━━━━━━━━━━━━━━━━━━━━┛
        `.trim();

        await sock.sendMessage(from, { 
            text: uptimeText 
        }, { quoted: msg });
    }
};
