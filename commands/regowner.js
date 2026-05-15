const fs = require('fs');
const path = require('path');

module.exports = {
    name: "regowner",
    category: "owner",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const botNumber = sock.user.id;
        const senderNumber = sender.split('@')[0].split(':')[0];
        const botNumberClean = botNumber.split('@')[0].split(':')[0];
        if (senderNumber !== botNumberClean && !isMe) {
            return sock.sendMessage(from, { text: "❌ Only the bot owner can register." });
        }
        global.ownerJid = sender;
        const ownerFile = path.join(__dirname, '..', 'owner.json');
        fs.writeFileSync(ownerFile, JSON.stringify({ ownerJid: sender }, null, 2));
        
        const accessQuotes = [
            "Access granted. You now hold the keys to the system.",
            "Identity verified. Full command authority unlocked.",
            "You are now recognized as the master of this machine.",
            "Control transferred. Use your power wisely.",
            "System acknowledges you. Welcome, commander.",
            "Privilege elevation complete. You may command the bot.",
            "Ownership recorded. The bot bends to your will.",
            "You've been given the crown. Don't lose it.",
            "Security clearance granted. All channels open.",
            "Welcome to the admin zone. Handle with chaos."
        ];
        const quote = accessQuotes[Math.floor(Math.random() * accessQuotes.length)];
        
        await sock.sendMessage(from, { text: `✅ ${quote}\n\n_⚡ Powered by Savage Tech_` });
    }
};
