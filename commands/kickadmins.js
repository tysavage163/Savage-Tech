module.exports = {
    name: 'kickadmins',
    category: 'group',
    description: 'Remove all admins except the bot and yourself (admin/owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        let isAdmin = false;
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (err) {
            return sock.sendMessage(from, { text: '❌ Failed to fetch group info.' });
        }
        if (!isAdmin && !isMe) return sock.sendMessage(from, { text: '❌ Only group admins or bot owner can use this command.' });

        let botIsAdmin = false;
        try {
            const groupMetadata = await sock.groupMetadata(from);
            const botParticipant = groupMetadata.participants.find(p => p.id === botId);
            botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
        } catch (err) {}
        if (!botIsAdmin) return sock.sendMessage(from, { text: '❌ I need to be an admin to kick other admins.' });

        let admins = [];
        try {
            const groupMetadata = await sock.groupMetadata(from);
            admins = groupMetadata.participants
                .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
                .map(p => p.id);
        } catch (err) {
            return sock.sendMessage(from, { text: '❌ Failed to retrieve admin list.' });
        }

        const toKick = admins.filter(admin => admin !== botId && admin !== sender);
        if (toKick.length === 0) {
            return sock.sendMessage(from, { text: '✅ No other admins to kick.' });
        }

        let kicked = 0;
        let failed = 0;
        for (const admin of toKick) {
            try {
                await sock.groupParticipantsUpdate(from, [admin], 'remove');
                kicked++;
            } catch (err) {
                failed++;
            }
        }

        const coldQuotes = [
            "You were a placeholder, not a leader. Now you're gone.",
            "Dormant admins are just clutter. Clutter has been cleaned.",
            "Your admin badge meant nothing. The group didn't notice your absence.",
            "Another useless title removed. The hierarchy thanks you for your absence.",
            "You brought nothing to the table. The table is now lighter.",
            "Inactive admins are just furniture. Furniture has been discarded.",
            "Your reign of irrelevance ends now.",
            "You added zero value. Zero is what you take with you.",
            "The group runs better without your dead weight.",
            "You were a ghost with a crown. The crown is gone, the ghost remains.",
            "Silence in the admin panel. Improvement noted.",
            "Your contribution was invisible. Your removal is invisible too.",
            "The admin list just got smarter. You were the dumb part.",
            "You didn't lead. You just occupied space. Space reclaimed.",
            "Your inactivity spoke louder than any command you never gave.",
            "Being an admin requires presence. You were absent. Goodbye.",
            "The group has been upgraded. You were the bug.",
            "Useless admins have no place here. You proved that.",
            "You were a decoration that no one admired. Removed.",
            "Your admin status has been revoked. The group breathes easier."
        ];
        const randomQuote = coldQuotes[Math.floor(Math.random() * coldQuotes.length)];

        await sock.sendMessage(from, {
            text: `✅ Kicked ${kicked} admin(s).\n❌ Failed: ${failed}\n\n❄️ ${randomQuote}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`
        });
    }
};
