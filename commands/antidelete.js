module.exports = {
    name: 'antidelete',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const supremeDeveloper = '254798841125@s.whatsapp.net';
        const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBoss = (sender === supremeDeveloper || sender === localOwner || msg.key.fromMe);

        if (!isBoss) {
            return sock.sendMessage(from, { text: "🚫 *ACCESS DENIED.*" });
        }

        const mode = args[0]?.toLowerCase();

        // Handle ".antidelete on" or ".antidelete chat"
        if (mode === 'on' || mode === 'chat') {
            global.antiDelete = 'chat';
            await sock.sendMessage(from, { 
                text: "🛡️ *GHOST PROTOCOL: ON*\nMode: [ CHAT ]\nStatus: Recovered messages will be re-posted publicly." 
            });
        } 
        // Handle ".antidelete private"
        else if (mode === 'private') {
            global.antiDelete = 'private';
            await sock.sendMessage(from, { 
                text: "🕵️ *GHOST PROTOCOL: ON*\nMode: [ PRIVATE ]\nStatus: Recovered messages sent only to the Architect." 
            });
        } 
        // Handle ".antidelete off"
        else if (mode === 'off') {
            global.antiDelete = 'off';
            await sock.sendMessage(from, { 
                text: "🚫 *GHOST PROTOCOL: OFF*\nStatus: Deletion tracking disabled." 
            });
        } 
        else {
            await sock.sendMessage(from, { 
                text: `*ANTI-DELETE OPTIONS:*\n\n1. ${global.prefix}antidelete on (Chat Mode)\n2. ${global.prefix}antidelete private\n3. ${global.prefix}antidelete off` 
            });
        }
    }
};
