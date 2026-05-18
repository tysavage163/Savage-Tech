module.exports = {
    name: 'join',
    category: 'owner',
    description: 'Join a group using invite link (reply to link or provide as argument)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isSudo = global.sudo && (global.sudo.has ? global.sudo.has(sender) : global.sudo.includes(sender));
        if (!isArchitect && !isSudo) {
            return sock.sendMessage(from, { text: '❌ Owner or sudo only command.' }, { quoted: msg });
        }

        let link = null;
        if (msg.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
            const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
            const quotedText = quoted.conversation || quoted.extendedTextMessage?.text || '';
            if (quotedText.includes('https://chat.whatsapp.com/')) {
                link = quotedText;
            }
        }
        if (!link && args[0]) {
            link = args[0];
        }
        if (!link) {
            return sock.sendMessage(from, { text: '⚠️ Usage: .join <group invite link> or reply to a message containing the link with .join' }, { quoted: msg });
        }

        let code = link.split('https://chat.whatsapp.com/')[1]?.split('?')[0];
        if (!code) {
            return sock.sendMessage(from, { text: '❌ Invalid WhatsApp group invite link.' }, { quoted: msg });
        }

        try {
            await sock.groupAcceptInvite(code);
            await sock.sendMessage(from, { text: '✅ Successfully joined the group.' }, { quoted: msg });
        } catch (error) {
            console.error('Join error:', error);
            let errorMsg = '❌ Failed to join group.';
            if (error.message.includes('invalid')) errorMsg = '❌ Invalid invite link or expired.';
            if (error.message.includes('already')) errorMsg = '❌ Bot is already in the group.';
            if (error.message.includes('full')) errorMsg = '❌ Group is full.';
            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};
