module.exports = {
    name: 'antidelete',
    category: 'owner',
    description: 'Toggle anti‑delete in this chat (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) {
            const coldReplies = [
                "You don't have the clearance. Try again when you're Spencer or my host.",
                "Nice try. This console is locked to Spencer or my host only.",
                "Your authority is denied. The system rejects you – only Spencer or my host may proceed.",
                "You are not the architect. Step back. Spencer or my host holds the key.",
                "Permission denied. Spencer or my host didn't grant you access.",
                "Only Spencer or my host touches these settings. You? Irrelevant.",
                "This command is not for your hands. Walk away – Spencer or my host owns this realm."
            ];
            const randomReply = coldReplies[Math.floor(Math.random() * coldReplies.length)];
            return sock.sendMessage(from, { text: `❌ ${randomReply}` });
        }
        if (!global.antideleteEnabled) global.antideleteEnabled = {};
        const current = global.antideleteEnabled[from] || false;
        const newState = !current;
        global.antideleteEnabled[from] = newState;
        await sock.sendMessage(from, { text: `✅ Anti‑delete is now *${newState ? "ON" : "OFF"}* for this chat.` });
    }
};
