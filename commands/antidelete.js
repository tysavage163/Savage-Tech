module.exports = {
    name: 'antidelete',
    category: 'admin',
    execute: async (sock, msg, args) => {
        const from = msg.key.remoteJid;
        const mode = args[0]?.toLowerCase();

        // Standardizing the input options
        const modes = {
            'on': 'on',
            'public': 'public',
            'private': 'private',
            'off': 'off'
        };

        if (modes[mode]) {
            global.antideleteMode = modes[mode];
            
            let response = "";
            switch(modes[mode]) {
                case 'on': 
                    response = "🛡️ *ANTIDELETE:* ENABLED (Default Chat)"; 
                    break;
                case 'public': 
                    response = "🛡️ *ANTIDELETE:* ENABLED (Sending to Chat)"; 
                    break;
                case 'private': 
                    response = "🕵️ *ANTIDELETE:* STEALTH MODE (Sending to Host Only)"; 
                    break;
                case 'off': 
                    response = "🔓 *ANTIDELETE:* DISABLED"; 
                    break;
            }

            return sock.sendMessage(from, { text: response });
        }

        // Help menu if they type it wrong
        const helpText = `
*S Λ V Λ G Ξ  -  CONFIG*

Usage:
.antidelete on
.antidelete off
.antidelete public
.antidelete private

*Current Mode:* ${global.antideleteMode.toUpperCase()}`;

        await sock.sendMessage(from, { text: helpText });
    }
};
