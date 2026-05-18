module.exports = {
    name: 'invite',
    category: 'group',
    description: 'Get group invite link (admin only). Use .invite reset to generate new link',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0];
            const participant = meta.participants.find(p => p.id.split('@')[0] === senderNumber);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {
            return sock.sendMessage(from, { text: '❌ Failed to verify admin status.' }, { quoted: msg });
        }
        if (!isAdmin) {
            return sock.sendMessage(from, { text: '🔒 Only group admins can use this command.' }, { quoted: msg });
        }

        const reset = args[0]?.toLowerCase() === 'reset';

        try {
            let code;
            if (reset) {
                code = await sock.groupRevokeInvite(from);
                await sock.sendMessage(from, { text: '🔄 Group invite link has been reset. New link generated.' }, { quoted: msg });
            } else {
                code = await sock.groupInviteCode(from);
            }
            const link = `https://chat.whatsapp.com/${code}`;
            await sock.sendMessage(from, { text: `🔗 *Group Invite Link*\n${link}\n\n_⚡ Powered by Savage-Tech_` }, { quoted: msg });
        } catch (err) {
            console.error('Invite error:', err);
            let errorMsg = '❌ Failed to get invite link. Make sure I am an admin in this group.';
            if (reset) errorMsg = '❌ Failed to reset invite link. Make sure I am an admin.';
            await sock.sendMessage(from, { text: errorMsg }, { quoted: msg });
        }
    }
};
