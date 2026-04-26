module.exports = {
    name: 'mode',
    category: 'owner',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        // Step 1: Restriction. Only the Host/Architect can toggle visibility.
        if (!isArchitect && !isMe) {
            return sock.sendMessage(msg.key.remoteJid, { 
                text: '❌ **Access Denied.** Only the Bot Host can toggle visibility.' 
            }, { quoted: msg });
        }

        const from = msg.key.remoteJid;
        const newMode = args[0]?.toLowerCase();

        // Step 2: Logic for toggling modes
        if (newMode === 'public') {
            global.mode = 'public';
            await sock.sendMessage(from, { text: '🌐 **SYSTEM MODE:** PUBLIC\n_Neural Link open to all units._' }, { quoted: msg });
        } else if (newMode === 'self') {
            global.mode = 'self';
            await sock.sendMessage(from, { text: '🔐 **SYSTEM MODE:** SELF\n_Neural Link restricted to authorized Host only._' }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { 
                text: `💡 **Usage:** .mode [public/self]\n**Current Status:** ${global.mode.toUpperCase()}` 
            }, { quoted: msg });
        }
    }
};
