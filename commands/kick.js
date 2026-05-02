// commands/kick.js – group kick with savage quotes, sends message before kicking
module.exports = {
    name: 'kick',
    category: 'group',
    description: 'Remove a member by replying to their message or tagging them',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        // Check if sender is admin or bot owner
        const sender = msg.key.participant || msg.key.remoteJid;
        const groupMetadata = await sock.groupMetadata(from);
        const participant = groupMetadata.participants.find(p => p.id === sender);
        const isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only admins or the bot owner can kick members.' });

        // Determine target user
        let target = null;

        // 1. If replying to a message
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quoted) {
            const quotedMsg = msg.message.extendedTextMessage.contextInfo;
            target = quotedMsg.participant;
        }

        // 2. If no reply, check mentions in command
        if (!target && msg.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
            target = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }

        // 3. If still no target, try first argument as a JID
        if (!target && args[0]) {
            let arg = args[0].replace('@', '');
            if (arg.includes('@s.whatsapp.net') || arg.includes('@g.us')) {
                target = arg;
            }
        }

        if (!target) {
            return sock.sendMessage(from, { text: '❓ Please tag the user or reply to their message.' });
        }

        // Prevent kicking the bot itself
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        if (target === botId) return sock.sendMessage(from, { text: '❌ You cannot kick the bot.' });

        // Savage quotes for kicks
        const kickQuotes = [
            "Your absence will be noted... as an improvement.",
            "Exit stage left. Permanently.",
            "You have been removed. The system thanks you for your temporary compliance.",
            "Don't let the door hit you where the good Lord split you.",
            "Kicked. The algorithm approved this decision.",
            "Consensus: you were noise. Now you are silence.",
            "Your membership has been terminated. Do not attempt to return.",
            "The group just got smarter.",
            "You've been purged. The weak have been filtered.",
            "Goodbye. Your replacement is already in line."
        ];
        const randomQuote = kickQuotes[Math.floor(Math.random() * kickQuotes.length)];
        const userName = target.split('@')[0];

        // Send message first (target is still in group, so mention works)
        await sock.sendMessage(from, { 
            text: `✅ *User @${userName} is about to be kicked.*\n\n❄️ "${randomQuote}"\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`,
            mentions: [target] 
        });

        // Then perform kick
        try {
            await sock.groupParticipantsUpdate(from, [target], 'remove');
        } catch (err) {
            console.error('Kick error:', err);
            let errorMsg = err.message;
            if (err.message.includes('not admin')) errorMsg = 'I need to be an admin to kick members.';
            await sock.sendMessage(from, { text: `❌ Failed to kick: ${errorMsg}` });
        }
    }
};
