module.exports = {
    name: 'mode',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // 🆔 IDENTITY DETECTION
        const supremeDeveloper = '254798841125@s.whatsapp.net'; // Spencer
        const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net'; // Current Paired Number

        const isAuthorized = (sender === supremeDeveloper || sender === localOwner);

        if (!isAuthorized) {
            return sock.sendMessage(from, { text: "❌ *Access Denied.* Only the Bot Host can toggle visibility." });
        }

        if (!args[0]) {
            return sock.sendMessage(from, { text: `🛰️ *Current Status:* ${global.isPublic ? "PUBLIC" : "PRIVATE"}\n\nUse *.mode public* or *.mode private*` });
        }

        const modeInput = args[0].toLowerCase();

        if (modeInput === 'public') {
            global.isPublic = true;
            await sock.sendMessage(from, { text: "🌐 *SYSTEM UPDATE:* Bot is now in PUBLIC mode. Commands accessible to all." });
        } else if (modeInput === 'private' || modeInput === 'self') {
            global.isPublic = false;
            await sock.sendMessage(from, { text: "🔒 *SYSTEM UPDATE:* Bot is now in PRIVATE mode. Commands restricted to Host." });
        } else {
            await sock.sendMessage(from, { text: "Usage: *.mode public* or *.mode private*" });
        }
    }
};
