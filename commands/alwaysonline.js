module.exports = {
    name: 'alwaysonline', // Match this to what you want to type
    category: 'owner',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        if (!isArchitect) return;

        if (global.autoTyping === 'off' || !global.autoTyping) {
            global.autoTyping = 'on';
            await sock.sendMessage(from, { text: "⌨️ *GHOST MODE:* ACTIVE." });
        } else {
            global.autoTyping = 'off';
            await sock.sendMessage(from, { text: "⌨️ *GHOST MODE:* DISABLED." });
        }
    }
};
