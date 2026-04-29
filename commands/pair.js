/*
╔══════════════════════════════════════════════════════╗
║  .pair – Direct to external pairing website          ║
║  Usage: .pair                                        ║
╚══════════════════════════════════════════════════════╝
*/

module.exports = {
    name: 'pair',
    category: 'tools',
    description: 'Get a link to pair your WhatsApp with the bot',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // The URL of your pairing website
        const pairUrl = 'https://savage-pair.vercel.app/';

        // Create an attractive message with the link
        const replyText = `🤖 *Savage Bot - Pairing*\n\n` +
            `Use the link below to pair your WhatsApp with the bot:\n\n` +
            `🔗 *Pairing Website:*\n${pairUrl}\n\n` +
            `📌 *Instructions:*\n` +
            `1️⃣ Click or copy the link above\n` +
            `2️⃣ Enter your phone number (with country code, e.g., 254...)\n` +
            `3️⃣ Generate the 8-digit code\n` +
            `4️⃣ Open WhatsApp → Settings → Linked Devices → Link a Device\n` +
            `5️⃣ Enter the code to connect\n\n` +
            `⚠️ *Note:* The code expires in 5 minutes.`;

        await sock.sendMessage(from, { text: replyText });
    }
};
