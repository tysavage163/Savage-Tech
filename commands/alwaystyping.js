module.exports = {
    name: 'alwaystyping',
    category: 'owner',
    desc: 'Force a constant typing presence on the network.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        
        // Locked to the Architect (The one who paired the bot)
        if (!isArchitect) return;

        if (global.autoTyping === 'off' || !global.autoTyping) {
            global.autoTyping = 'on';
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* ONLINE.\n\n_Constant typing signal broadcast initiated. You are now a ghost in the machine._" 
            });
        } else {
            global.autoTyping = 'off';
            // Reset status to available
            await sock.sendPresenceUpdate('available', from);
            global.autoTyping = 'off';
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* OFFLINE.\n\n_Signal terminated. Presence returning to standard parameters._" 
            });
        }
    }
};
