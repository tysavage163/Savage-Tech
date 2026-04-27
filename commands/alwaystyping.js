module.exports = {
    name: 'alwaysonline',
    category: 'owner',
    desc: 'Toggle constant typing status with on/off.',
    execute: async (sock, msg, args, { isArchitect }) => {
        const from = msg.key.remoteJid;
        
        if (!isArchitect) return;

        const input = args[0] ? args[0].toLowerCase() : null;

        // Logic for ".alwaysonline on"
        if (input === 'on') {
            global.autoTyping = 'on';
            return await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* ONLINE\n\n_Manual override: Broadcasting typing signal._" 
            });
        }

        // Logic for ".alwaysonline off"
        if (input === 'off') {
            global.autoTyping = 'off';
            await sock.sendPresenceUpdate('available', from); 
            return await sock.sendMessage(from, { 
                text: "⌨️ *GHOST ENGINE:* OFFLINE\n\n_Manual override: Signal terminated._" 
            });
        }

        // Fallback: If they just type ".alwaysonline" without args, it just toggles
        if (global.autoTyping === 'off' || !global.autoTyping) {
            global.autoTyping = 'on';
            await sock.sendMessage(from, { text: "⌨️ *GHOST ENGINE:* ONLINE" });
        } else {
            global.autoTyping = 'off';
            await sock.sendPresenceUpdate('available', from); 
            await sock.sendMessage(from, { text: "⌨️ *GHOST ENGINE:* OFFLINE" });
        }
    }
};
