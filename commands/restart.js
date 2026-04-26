module.exports = {
    category: 'owner',
    name: 'restart',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const developer = '254798841125@s.whatsapp.net';

        // STRICT LOCK: Only the Developer ID or the Bot Host
        if (sender !== developer && !msg.key.fromMe) {
            return sock.sendMessage(from, { text: '⚠️ *Security Breach:* You do not have permission to reboot the SΛVΛGΞ Engine.' }, { quoted: msg });
        }

        const rebootMsg = `
╔════◇ 【 **SΛVΛGΞ ЯΣBӨӨƬ** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Rebooting...
┣┫ 👤 **AUTH:** Architect Verified
║
┣━━◇ 【 **ПӨƬΣ** 】 ◇━━┫
║
┣┫ ✨ Engine will be offline for 
┣┫    approx 5-10 seconds.
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

        await sock.sendMessage(from, { text: rebootMsg }, { quoted: msg });

        setTimeout(() => {
            process.exit(); 
        }, 2000);
    }
};
