module.exports = {
    async sendWelcome(sock, id, participant, groupName) {
        const quotes = [
            "New biometric signature detected. Access granted.",
            "A new gear has been added to the engine. Do not malfunction.",
            "Recruit identified. Welcome to the SΛVΛGΞ-TECH perimeter."
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(id, { 
            text: `☣️ *WELCOME TO ${groupName}*\n\n@${participant.split('@')[0]}\n"_${quote}_"`,
            mentions: [participant]
        });
    },

    async sendGoodbye(sock, id, participant) {
        const quotes = [
            "Biometric signature lost. Subject has been purged.",
            "One less malfunction in the system. Perimeter secured.",
            "Access revoked. The engine continues without you.",
            "Subject eliminated from the hierarchy. Silence restored."
        ];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        await sock.sendMessage(id, { 
            text: `☢️ *PERIMETER UPDATE*\n\n@${participant.split('@')[0]}\n"_${quote}_"`,
            mentions: [participant]
        });
    }
};
