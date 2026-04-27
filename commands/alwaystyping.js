module.exports = {
    name: 'alwaystyping',
    category: 'owner',
    desc: 'Toggle the Ghost Engine typing signal.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        if (!isArchitect) return;

        const input = args[0] ? args[0].toLowerCase() : null;

        if (input === 'on' || (input === null && global.autoTyping !== 'on')) {
            global.autoTyping = 'on';
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* ONLINE\n\n_Signal broadcast active._" 
            });
        } else {
            global.autoTyping = 'off';
            
            // --- THE CRITICAL FIX ---
            // 1. Force the 'available' status to kill the typing bubble immediately
            await sock.sendPresenceUpdate('available', from);
            // 2. Also send it to your own ID to clear the global server cache
            await sock.sendPresenceUpdate('available', sock.user.id);
            
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* OFFLINE\n\n_Signal terminated. Presence reset to idle._" 
            });
        }
    }
};
