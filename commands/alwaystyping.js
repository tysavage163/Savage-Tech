module.exports = {
    name: 'alwaystyping',
    category: 'owner',
    desc: 'Toggle the continuous typing signal.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        
        // Security: Only the paired account (Architect) can toggle this
        if (!isArchitect) return;

        // Normalize input (e.g., .alwaystyping ON -> on)
        const input = args[0] ? args[0].toLowerCase() : null;

        // Check current state or forced input
        if (input === 'on' || (input === null && global.autoTyping !== 'on')) {
            global.autoTyping = 'on';
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* ONLINE\n\n_Broadcasting continuous typing signal. Use '.alwaystyping off' to terminate._" 
            });
        } else {
            global.autoTyping = 'off';
            // Force status to available to stop the typing indicator immediately
            await sock.sendPresenceUpdate('available', from); 
            await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* OFFLINE\n\n_Signal terminated._" 
            });
        }
    }
};
