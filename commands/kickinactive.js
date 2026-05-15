module.exports = {
    name: "kickinactive",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' });

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0].split(':')[0];
            const participant = meta.participants.find(p => {
                const pNumber = p.id.split('@')[0].split(':')[0];
                return pNumber === senderNumber;
            });
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {}
        if (!isAdmin) return sock.sendMessage(from, { text: 'Only group admins can use this command.' });

        let days = parseInt(args[0]);
        if (isNaN(days) || days < 1) days = 2;
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

        const metadata = await sock.groupMetadata(from);
        const adminJids = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);

        const inactive = [];
        for (const p of metadata.participants) {
            const jid = p.id;
            if (adminJids.includes(jid)) continue;
            const lastMsg = global.lastMessageTime?.[from]?.[jid];
            if (!lastMsg || lastMsg < cutoff) {
                inactive.push(jid);
            }
        }

        if (inactive.length === 0) return sock.sendMessage(from, { text: `No inactive members found (inactive for ${days} days).` });

        if (!global.kickinactiveCancel) global.kickinactiveCancel = new Set();
        global.kickinactiveCancel.add(from);

        await sock.sendMessage(from, { text: `Found ${inactive.length} inactive members. Will be kicked in 5 seconds. Type .cancelinactive to cancel execution.` });

        let cancelled = false;
        const cancelCheck = setInterval(() => {
            if (!global.kickinactiveCancel.has(from)) {
                cancelled = true;
                clearInterval(cancelCheck);
            }
        }, 500);

        await new Promise(resolve => setTimeout(resolve, 5000));
        clearInterval(cancelCheck);

        if (cancelled || !global.kickinactiveCancel.has(from)) {
            global.kickinactiveCancel.delete(from);
            return sock.sendMessage(from, { text: 'Kickinactive cancelled by admin.' });
        }

        global.kickinactiveCancel.delete(from);

        const savageQuotes = [
            'You have been silent for too long. The group moves on without you.',
            'Inactivity is a choice. You chose to be irrelevant.',
            'Your silence speaks louder than words. Consider this your removal notice.',
            'Dead weight has no place here. Goodbye.',
            'You had time to speak. You didn't. Now you have time to leave.',
            'Lurking without contributing is not a virtue. You are now gone.',
            'The group cleanses itself of ghosts. You were one of them.',
            'No messages, no presence, no reason to stay. Removed.',
            'You were a memory. Now you are forgotten.',
            'Activity is the price of membership. You stopped paying.'
        ];
        const randomQuote = savageQuotes[Math.floor(Math.random() * savageQuotes.length)];

        await sock.sendMessage(from, { text: `${randomQuote}\n\nRemoving inactive members:\n${inactive.map(j => `@${j.split('@')[0]}`).join('\n')}`, mentions: inactive });

        let kicked = 0;
        for (let user of inactive) {
            try {
                await sock.groupParticipantsUpdate(from, [user], "remove");
                kicked++;
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {}
        }
        await sock.sendMessage(from, { text: `Kickinactive completed. Removed ${kicked}/${inactive.length} members.` });
    }
};
