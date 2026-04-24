module.exports = {
    name: 'antitag',
    category: 'config',
    execute: async (sock, msg, args, { isArchitect, isMe }) => {
        const from = msg.key.remoteJid;

        // ONLY YOU (THE ARCHITECT) CAN TOGGLE THIS
        if (!isArchitect && !isMe) return;

        const mode = args[0]?.toLowerCase();

        if (mode === 'on') {
            global.antitag = 'on';
            await sock.sendMessage(from, { 
                text: '🛡️ *STUPIDITY CLEANSING PROTOCOL:* INITIATED\n_Targeting irrelevant mentions for immediate disposal._' 
            });
        } else if (mode === 'off') {
            global.antitag = 'off';
            await sock.sendMessage(from, { 
                text: '🛡️ *STUPIDITY CLEANSING PROTOCOL:* ABORTED\n_Noise filters deactivated._' 
            });
        } else {
            await sock.sendMessage(from, { 
                text: `*USAGE:* ${global.prefix}antitag on/off\n*STATUS:* ${global.antitag === 'on' ? 'ACTIVE' : 'STANDBY'}` 
            });
        }
    }
};
