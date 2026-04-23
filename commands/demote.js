module.exports = {
    name: 'demote',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Ensure it's a group
        if (!from.endsWith('@g.us')) return;

        // Get tagged users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) return sock.sendMessage(from, { text: 'Tag the one whose power must be stripped.' });

        // Cold Demotion Quotes
        const demoteLines = [
            "Your time in the sun is over. Back to the shadows.",
            "Authority revoked. You couldn't handle the weight.",
            "Stripped of your rank. Don't take it personally.",
            "You've been downgraded. Relevance: Zero.",
            "Power is a privilege, not a right. You just lost yours.",
            "Back to the bottom of the food chain.",
            "The crown was too heavy for you. I'll take it back now.",
            "Access denied. Your seat at the table has been removed.",
            "A fall from grace. Try not to let it hurt.",
            "Rank reset. Start from the beginning, if you can."
        ];

        const savageLine = demoteLines[Math.floor(Math.random() * demoteLines.length)];

        try {
            await sock.groupParticipantsUpdate(from, mentioned, "demote");
            await sock.sendMessage(from, { text: `*HIERARCHY UPDATE:* \n\n"${savageLine}"` });
        } catch (e) {
            await sock.sendMessage(from, { text: "Error: I need Admin status to strip power." });
        }
    }
};
