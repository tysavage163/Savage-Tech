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
            return sock.sendMessage(from, { text: "❌ Only the bot owner can register." }, { quoted: msg });
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
            "Welcome to the admin zone. Handle with chaos.",
            "The throne is yours. May your reign be legendary.",
            "Ownership set. You are the architect of this digital realm.",
            "The bot now recognizes you as its sovereign.",
            "Admin privileges unlocked. Proceed with responsibility.",
            "You are now the supreme commander of Savage Tech.",
            "The system bows to you. Command wisely.",
            "Ownership transferred. Your will is law.",
            "Welcome to the inner circle. You now control the core.",
            "The keys to the kingdom are yours. Use them well.",
            "You've been marked as the ultimate authority. No limits."
        ];
        const quote = accessQuotes[Math.floor(Math.random() * accessQuotes.length)];
        
        await sock.sendMessage(from, { text: `✅ ${quote}\n\n_⚡ Powered by Savage Tech_` }, { quoted: msg });
    }
};
