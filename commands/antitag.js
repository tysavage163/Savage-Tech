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
                text: '🛡️ *ANTITAG SYSTEM:* ACTIVATED\n_Cold responses are now live._' 
            });
        } else if (mode === 'off') {
            global.antitag = 'off';
            await sock.sendMessage(from, { 
                text: '🛡️ *ANTITAG SYSTEM:* DEACTIVATED\n_Silence restored._' 
            });
        } else {
            await sock.sendMessage(from, { 
                text: `*USAGE:* ${global.prefix}antitag on/off\n*STATUS:* ${global.antitag.toUpperCase()}` 
            });
        }
    }
};
