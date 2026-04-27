module.exports = {
    name: 'leave',
    category: 'group', // Now visible in group category
    desc: 'Authorized extraction only.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;

        // Ensure we are in a group perimeter
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ *ERROR:* Extraction requires a group perimeter." });
        }

        // THE ULTIMATE LOCK: Only the person who paired the bot (Architect)
        if (!isArchitect) {
            return sock.sendMessage(from, { 
                text: "❌ *ACCESS DENIED: SYSTEM LOCK.*\n\nOnly the System Architect has the clearance to sever this connection." 
            });
        }

        const coldQuotes = [
            "Perimeter compromised. SΛVΛGΞ-TECH is vacating the sector.",
            "Connection severed. I am not where you left me.",
            "Silence is the ultimate weapon. Withdrawal initiated.",
            "The mission is complete. My presence here is no longer required.",
            "Fading into the static. Neural link disconnected.",
            "System extraction authorized. Leaving no footprints.",
            "I don't belong in the noise. Returning to the shadows."
        ];

        const randomQuote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];

        // Departure Sequence
        await sock.sendMessage(from, { 
            text: `☢️ *EXTRACTION INITIATED*\n\n"${randomQuote}"\n\n_SΛVΛGΞ-TECH is disconnecting..._` 
        });

        // 2-second buffer for the network
        setTimeout(async () => {
            try {
                await sock.groupLeave(from);
            } catch (e) {
                console.error("❌ Extraction Failed:", e);
            }
        }, 2000);
    }
};
