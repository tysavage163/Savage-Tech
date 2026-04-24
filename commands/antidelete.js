module.exports = {
    name: 'antidelete',
    category: 'admin',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const mode = args[0]?.toLowerCase();

        // 1. Check input
        if (mode === 'on') {
            global.antideleteMode = 'on';
            return sock.sendMessage(from, { 
                text: '🛡️ *ANTIDELETE:* ACTIVE\n\n_All recovered messages will be redirected to the Host phone in Stealth Mode._' 
            });
        }

        if (mode === 'off') {
            global.antideleteMode = 'off';
            return sock.sendMessage(from, { 
                text: '🔓 *ANTIDELETE:* DISABLED\n\n_Deletions will no longer be logged._' 
            });
        }

        // 2. Help Menu (If user types .antidelete incorrectly)
        const currentStatus = global.antideleteMode === 'on' ? 'ACTIVE 🛡️' : 'DISABLED 🔓';
        
        const helpText = `
*S Λ V Λ G Ξ  -  ANTIDELETE*

*Current Status:* ${currentStatus}

*Usage:*
.antidelete on  -  Start Stealth Logs
.antidelete off -  Stop Logging

_Note: For security, all data is sent to the Host account only._`;

        await sock.sendMessage(from, { text: helpText });
    }
};
