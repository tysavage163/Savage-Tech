module.exports = {
    name: 'autotyping',
    category: 'owner',
    desc: 'Force constant typing status.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        if (!isArchitect) return sock.sendMessage(from, { text: "❌ Access Denied." });

        if (global.autoTyping === "off") {
            global.autoTyping = "on";
            await sock.sendMessage(from, { text: "⌨️ *GHOST MODE:* ENABLED. Constant typing is active." });
        } else {
            global.autoTyping = "off";
            await sock.sendPresenceUpdate('available', from);
            await sock.sendMessage(from, { text: "⌨️ *GHOST MODE:* DISABLED." });
        }
    }
};
