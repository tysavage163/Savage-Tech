module.exports = {
    name: 'approveall',
    category: 'group',
    description: 'Approve all pending join requests (admin only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        // Check if sender is admin or bot owner
        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {}
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only admins or bot owner can approve requests.' });

        // Fetch pending join requests
        let pending = [];
        try {
            // Using groupRequestParticipantsList (Baileys method)
            const requests = await sock.groupRequestParticipantsList(from);
            if (requests && requests.length) {
                pending = requests.filter(req => req.status === 'pending').map(req => req.jid);
            }
        } catch (err) {
            console.error('Failed to get pending requests:', err);
            return sock.sendMessage(from, { text: '❌ Failed to fetch pending requests. Ensure the bot is admin and has permissions.' });
        }

        if (pending.length === 0) {
            return sock.sendMessage(from, { text: '✅ No pending join requests at the moment.' });
        }

        // Approve all pending requests
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

        await sock.sendMessage(from, { text: `✅ Approved ${approved} join requests.\n❌ Failed: ${failed}` });
    }
};
