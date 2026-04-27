module.exports = {
    name: "inspect",
    category: "tools",
    async execute(sock, msg, args) {
        const q = args[0] || (msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.conversation);
        if (!q || !q.includes('chat.whatsapp.com')) return sock.sendMessage(msg.key.remoteJid, { text: "☣️ *ERROR:* Provide a valid group link." });
        
        const code = q.split('https://chat.whatsapp.com/')[1];
        const metadata = await sock.groupGetInviteInfo(code);
        
        const text = `🔍 **GROUP INSPECTION**\n\n` +
            `🔹 **Name:** ${metadata.subject}\n` +
            `🔹 **Owner:** ${metadata.owner.split('@')[0]}\n` +
            `🔹 **Created:** ${new Date(metadata.creation * 1000).toLocaleString()}\n` +
            `🔹 **Size:** ${metadata.size} members\n` +
            `🔹 **Desc:** ${metadata.desc || 'No description'}`;
            
        await sock.sendMessage(msg.key.remoteJid, { text }, { quoted: msg });
    }
};
