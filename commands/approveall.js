module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve all pending join requests (admin only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {}
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only admins or bot owner can approve requests.' });

        const pending = global.pendingJoinRequests?.[from] || [];
        if (pending.length === 0) {
            return sock.sendMessage(from, { text: '✅ No pending join requests at the moment.' });
        }

        let approved = 0;
        let failed = 0;
        for (const jid of pending) {
            try {
                await sock.groupParticipantsUpdate(from, [jid], 'add');
                approved++;
            } catch (err) {
                console.error(`Failed to approve ${jid}:`, err);
                failed++;
            }
        }
        // Clear the pending list for this group
        delete global.pendingJoinRequests[from];

        await sock.sendMessage(from, { text: `✅ Approved ${approved} join requests.\n❌ Failed: ${failed}` });
    }
};
