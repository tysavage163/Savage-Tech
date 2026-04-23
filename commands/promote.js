module.exports = {
    name: 'promote',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Ensure it's a group
        if (!from.endsWith('@g.us')) return;

        // Get tagged users
        const mentioned = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentioned.length === 0) return sock.sendMessage(from, { text: 'Tag the individual worthy of power.' });

        // Cold Elite Quotes
        const eliteLines = [
            "Welcome to the inner circle. Don't make me regret it.",
            "Power handed over. Handle it with precision.",
            "You've been elevated. Don't look down.",
            "The hierarchy has shifted. Use your new rank wisely.",
            "Welcome to the elite. Few make it this far.",
            "Rank updated. You now have a seat at the table.",
            "Promotion granted. Loyalty is expected, not requested.",
            "Access levels increased. Welcome to the top.",
            "The crown is heavy. Let's see if you can carry it.",
            "Authority assigned. Make it count."
        ];

        const savageLine = eliteLines[Math.floor(Math.random() * eliteLines.length)];

        try {
            await sock.groupParticipantsUpdate(from, mentioned, "promote");
            await sock.sendMessage(from, { text: `*AUTHORITY UPDATE:* \n\n"${savageLine}"` });
        } catch (e) {
            await sock.sendMessage(from, { text: "Error: I require Admin status to grant power." });
        }
    }
};
