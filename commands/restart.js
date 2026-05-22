module.exports = {
    name: 'restart',
    category: 'owner',
    description: 'Restart the bot (owner & sudo only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        const isOwner = sender === global.ownerJid;
        const isSudo = global.sudoers && global.sudoers.includes(sender);
        
        if (!isMe && !isOwner && !isSudo) {
            return sock.sendMessage(from, { text: '❌ Only owner and sudo users can use this command.' }, { quoted: msg });
        }
        
        await sock.sendMessage(from, { text: '🔄 Bot restarting...' }, { quoted: msg });
        process.exit(0);
    }
};
