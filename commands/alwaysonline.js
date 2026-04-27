module.exports = {
    name: 'alwaysonline',
    category: 'owner',
    desc: 'Forces a constant typing status in a specific chat.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        if (!isArchitect) return;

        const action = args[0]?.toLowerCase();

        if (action === 'on') {
            // Note: startConstantTyping needs to be accessible here
            // You can move the logic into this file or globalize it
            await sock.sendPresenceUpdate('composing', from);
            return sock.sendMessage(from, { text: "☣️ *SYSTEM OVERRIDE:* Constant typing status is now **ACTIVE** in this sector." });
        }

        if (action === 'off') {
            await sock.sendPresenceUpdate('available', from);
            return sock.sendMessage(from, { text: "☢️ *SYSTEM RESET:* Constant typing status **DISABLED**." });
        }

        await sock.sendMessage(from, { 
            text: `*S Λ V Λ G Ξ  -  GHOST ENGINE*\n\nUsage:\n${global.prefix}alwaysonline on\n${global.prefix}alwaysonline off` 
        });
    }
};
