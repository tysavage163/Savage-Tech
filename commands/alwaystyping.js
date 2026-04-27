module.exports = {
    name: 'alwaystyping',
    category: 'owner',
    desc: 'Toggle constant typing status.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        
        // Safety: Only you (the Architect) can flip this switch
        if (!isArchitect) return;

        // Toggle Logic
        if (global.autoTyping === 'off' || !global.autoTyping) {
            global.autoTyping = 'on';
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* ONLINE\n\n_System is now broadcasting a continuous typing signal._" 
            });
        } else {
            global.autoTyping = 'off';
            // Force a status reset so you don't stay stuck as "typing"
            await sock.sendPresenceUpdate('available', from); 
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* OFFLINE\n\n_Signal terminated. Presence returning to idle._" 
            });
        }
    }
};
