/*
╔══════════════════════════════════════════════════════════╗
║  approveall – Approve all pending join requests         ║
║  Usage: .approveall                                      ║
║  Only group admins or bot owner can use                  ║
╚══════════════════════════════════════════════════════════╝
*/

module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve all pending join requests in the group',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        
        // Check if it's a group
        if (!from.endsWith('@g.us')) {
            return await sock.sendMessage(from, { text: '❌ This command can only be used in groups.' });
        }

        // Check if bot is admin
        const groupMetadata = await sock.groupMetadata(from);
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBotAdmin = groupMetadata.participants.some(p => p.id === botId && p.admin === 'admin' || p.admin === 'superadmin');
        
        if (!isBotAdmin) {
            return await sock.sendMessage(from, { text: '❌ I need to be an admin to approve join requests.' });
        }

        // Get pending participants
        const pendingParticipants = groupMetadata.participants.filter(p => p.isPending === true);
        
        if (pendingParticipants.length === 0) {
            return await sock.sendMessage(from, { text: '📭 No pending join requests in this group.' });
        }

        const pendingIds = pendingParticipants.map(p => p.id);
        
        await sock.sendMessage(from, { text: `⏳ Approving ${pendingIds.length} pending request(s)...` });

        try {
            // Approve all pending participants
            await sock.groupParticipantsUpdate(from, pendingIds, 'approve');
            await sock.sendMessage(from, { 
                text: `✅ Successfully approved ${pendingIds.length} participant(s)!\n\n👥 Approved:\n${pendingIds.map(id => `• @${id.split('@')[0]}`).join('\n')}`,
                mentions: pendingIds
            });
        } catch (error) {
            console.error('Approveall error:', error);
            await sock.sendMessage(from, { text: '❌ Failed to approve pending participants. Make sure I have admin privileges and try again.' });
        }
    }
};
