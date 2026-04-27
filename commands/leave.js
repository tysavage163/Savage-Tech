module.exports = {
    name: 'leave',
    category: 'group',
    desc: 'Authorized extraction only.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;

        // If the index.js check above worked, this will finally let you through
        if (!isArchitect) {
            return sock.sendMessage(from, { 
                text: "❌ *ACCESS DENIED: SYSTEM LOCK.*\n\nOnly the System Architect has clearance." 
            });
        }

        if (!from.endsWith('@g.us')) return;

        await sock.sendMessage(from, { text: "☢️ *EXTRACTION INITIATED*" });

        setTimeout(async () => {
            await sock.groupLeave(from);
        }, 2000);
    }
};
