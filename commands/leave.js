module.exports = {
    name: 'leave',
    category: 'group',
    desc: 'Authorized extraction only.',
    execute: async (sock, msg, args, { isArchitect, isMe }) => {
        const from = msg.key.remoteJid;

        // --- THE NO-FAIL CHECK ---
        // If it's from you (isMe) or the index verified you (isArchitect), you pass.
        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, { 
                text: "❌ *ACCESS DENIED: SYSTEM LOCK.*\n\nOnly the System Architect has the clearance to sever this connection." 
            });
        }

        if (!from.endsWith('@g.us')) return;

        const coldQuotes = [
            "Perimeter compromised. SΛVΛGΞ-TECH is vacating the sector.",
            "Connection severed. I am not where you left me.",
            "Silence is the ultimate weapon. Withdrawal initiated.",
            "System extraction authorized. Leaving no footprints.",
            "Architecture shifting. This location is now obsolete."
        ];

        const randomQuote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];

        await sock.sendMessage(from, { 
            text: `☢️ *EXTRACTION INITIATED*\n\n"${randomQuote}"` 
        });

        setTimeout(async () => {
            try {
                await sock.groupLeave(from);
            } catch (e) {
                console.error("❌ Leave Error:", e);
            }
        }, 2000);
    }
};
