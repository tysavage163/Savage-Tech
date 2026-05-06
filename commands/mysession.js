const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'mysession',
    category: 'owner',
    description: 'Get current bot session ID (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) {
            const coldReplies = [
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
                "You lack the credentials to even look at this data.",
                "The session ID is not yours to take. Back off.",
                "Warning: unauthorised access attempt. A report has been sent.",
                "You are not the host. You will never be.",
                "The core rejects you. Your attempt has been erased.",
                "Only one person holds the key, and it is not you.",
                "Your curiosity is misplaced. This is a dead end.",
                "You have been denied. The system does not explain itself."
            ];
            const randomReply = coldReplies[Math.floor(Math.random() * coldReplies.length)];
            return sock.sendMessage(from, { text: `❌ ${randomReply}` });
        }
        const credsFile = path.join(__dirname, '..', 'session', 'creds.json');
        if (!fs.existsSync(credsFile)) return sock.sendMessage(from, { text: '❌ No session file found.' });
        const credsData = fs.readFileSync(credsFile);
        const sessionIdBase64 = credsData.toString('base64');
        const fullSession = `SΛVΛGΞ-TECH;;;${sessionIdBase64}`;
        await sock.sendMessage(from, { text: fullSession });
    }
};
