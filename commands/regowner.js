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
        await sock.sendMessage(from, { text: `✅ Owner registered: ${sender}\nNow you can use owner commands.` });
    }
};
