module.exports = {
    name: 'kick',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Ensure it's a group
        if (!from.endsWith('@g.us')) return;

        // Get tagged users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) return sock.sendMessage(from, { text: 'Tag the victim.' });

        // Cold Departure Quotes
        const coldLines = [
            "Access revoked. You weren't worth the bandwidth.",
            "The trash has been taken out. 🚮",
            "This isn't a charity. Goodbye.",
            "You were a guest, now you're a memory.",
            "Error 404: Your relevance not found. 👋",
            "Survival of the fittest. You didn't make the cut.",
            "Don't look back. You aren't going that way.",
            "One less distraction. Proceeding with quality.",
            "Door's closed. Keep walking.",
            "Target eliminated. Cleaning the chat... 🧼"
        ];

        const savageLine = coldLines[Math.floor(Math.random() * coldLines.length)];

        try {
            await sock.groupParticipantsUpdate(from, mentioned, "remove");
            await sock.sendMessage(from, { text: `*SYSTEM UPDATE:* \n\n"${savageLine}"` });
        } catch (e) {
            await sock.sendMessage(from, { text: "Error: I need Admin powers to do that." });
        }
    }
};
