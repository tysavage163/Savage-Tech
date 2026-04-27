module.exports = {
    name: 'leave',
    category: 'owner',
    desc: 'Authorized extraction only.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;

        // Check if it's a group
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: "❌ *Error:* Extraction can only be initiated from within a group perimeter." });
        }

        // ABSOLUTE FIREWALL: Only the Architect (isArchitect from index.js)
        if (!isArchitect) {
            return sock.sendMessage(from, { 
                text: "❌ *CRITICAL ERROR:* Unauthorized extraction attempt detected. Access Denied." 
            });
        }

        // Departure Sequence
        await sock.sendMessage(from, { 
            text: "☢️ *SΛVΛGΞ-TECH EXTRACTION:* Perimeter withdrawal authorized by Architect. Connection severing..." 
        });

        // 2-second buffer for the network to process the message before the exit
        setTimeout(async () => {
            try {
                await sock.groupLeave(from);
            } catch (e) {
                console.error("❌ Extraction Failed:", e);
            }
        }, 2000);
    }
};
