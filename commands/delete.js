module.exports = {
    name: 'delete',
    category: 'group',
    description: 'Delete a replied message (admin only in groups, owner also in private)',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return sock.sendMessage(from, { text: '⚠️ Reply to the message you want to delete.' }, { quoted: msg });
        }

        let isAdmin = false;
        let isGroup = from.endsWith('@g.us');

        if (isGroup) {
            try {
                const groupMeta = await sock.groupMetadata(from);
                const senderNumber = sender.split('@')[0];
                const participant = groupMeta.participants.find(p => p.id.split('@')[0] === senderNumber);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            } catch (err) {
                console.log('Group metadata error:', err);
            }
        }

        const allowed = isArchitect || (isGroup && isAdmin);

        if (!allowed) {
            return sock.sendMessage(from, { text: '❌ You need to be a group admin (or bot owner) to delete messages.' }, { quoted: msg });
        }

        const keyToDelete = {
            remoteJid: from,
            id: msg.message.extendedTextMessage.contextInfo.stanzaId,
            fromMe: false
        };

        try {
            await sock.sendMessage(from, { delete: keyToDelete });
            await sock.sendMessage(from, { text: '✅ Message deleted.' }, { quoted: msg });
        } catch (err) {
            console.error('Delete error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to delete. Make sure I have admin privileges in the group.' }, { quoted: msg });
        }
    }
};
