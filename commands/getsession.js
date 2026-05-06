const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'getsession',
    category: 'owner',
    description: 'Get current bot session ID (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) {
            const coldReplies = [
                "You don't have the clearance. Try again when you're Spencer or my host.",
                "Nice try. This console is locked to Spencer or my host only.",
                "Your authority is denied. The system rejects you – only Spencer or my host may proceed.",
                "You are not the architect. Step back. Spencer or my host holds the key.",
                "Permission denied. Spencer or my host didn't grant you access.",
                "Only Spencer or my host touches these settings. You? Irrelevant.",
                "This command is not for your hands. Walk away – Spencer or my host owns this realm.",
                "Access denied. Your biometrics do not match the host.",
                "This is a restricted zone. Your presence has been logged.",
                "You are not the architect. Step away from the console.",
                "Classified information. Your clearance level is zero.",
                "Intrusion detected. The system does not recognise your signature.",
                "You have no authority here. The session remains sealed.",
                "Only the host may peer into the core. You are irrelevant.",
                "Your request has been filed under: unauthorised. Goodbye.",
                "The vault does not open for strangers. Walk away.",
                "You are trying to access something that does not belong to you.",
                "Security override rejected. Your IP is now monitored.",
                "This command is not for your eyes. The system is watching.",
                "You lack the credentials to even look at this data."
            ];
            const randomReply = coldReplies[Math.floor(Math.random() * coldReplies.length)];
            return sock.sendMessage(from, { text: `❌ ${randomReply}` });
        }
        const credsFile = path.join(__dirname, '..', 'session', 'creds.json');
        if (!fs.existsSync(credsFile)) {
            return sock.sendMessage(from, { text: '❌ No session file found. The bot may not be connected yet.' });
        }
        const credsData = fs.readFileSync(credsFile);
        const sessionIdBase64 = credsData.toString('base64');
        const fullSession = `SΛVΛGΞ-TECH;;;${sessionIdBase64}`;
        await sock.sendMessage(from, { text: fullSession });
    }
};
