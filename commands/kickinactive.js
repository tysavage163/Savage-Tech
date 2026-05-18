module.exports = {
    name: "kickinactive",
    category: "group",
    description: "Kick members inactive for X days (default 2)",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

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
        if (!isAdmin) return sock.sendMessage(from, { text: '🔒 Only group admins can use this command.' }, { quoted: msg });

        let days = parseInt(args[0]);
        if (isNaN(days) || days < 1) days = 2;
        const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

        const metadata = await sock.groupMetadata(from);
        const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const adminJids = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);

        const inactive = [];
        const skipped = [];
        for (const p of metadata.participants) {
            const jid = p.id;
            if (jid === botJid) continue;
            if (adminJids.includes(jid)) continue;
            const lastMsg = global.lastMessageTime?.[from]?.[jid];
            if (!lastMsg) {
                skipped.push(jid);
                continue;
            }
            if (lastMsg < cutoff) {
                inactive.push(jid);
            }
        }

        if (inactive.length === 0 && skipped.length === 0) {
            return sock.sendMessage(from, { text: `📊 No inactive members found (inactive for ${days} days).` }, { quoted: msg });
        }

        let warnMsg = `Found ${inactive.length} inactive members (no messages in ${days} days).`;
        if (skipped.length > 0) warnMsg += `\n⚠️ ${skipped.length} members have no message data (never spoke since bot started) – skipped to avoid false kick.`;

        await sock.sendMessage(from, { text: warnMsg }, { quoted: msg });

        if (inactive.length === 0) return;

        if (!global.kickinactiveCancel) global.kickinactiveCancel = new Set();
        global.kickinactiveCancel.add(from);

        await sock.sendMessage(from, { text: `⏳ Will kick ${inactive.length} members in 5 seconds. Type .cancelinactive to cancel.` }, { quoted: msg });

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
            return sock.sendMessage(from, { text: '❌ Kickinactive cancelled by admin.' }, { quoted: msg });
        }

        global.kickinactiveCancel.delete(from);

        const quotes = [
            'You have been silent for too long. The group moves on without you.',
            'Inactivity is a choice. You chose to be irrelevant.',
            'Your silence speaks louder than words. Consider this your removal notice.',
            'Dead weight has no place here. Goodbye.',
            'You had time to speak. You didn\'t. Now you have time to leave.',
            'Lurking without contributing is not a virtue. You are now gone.',
            'The group cleanses itself of ghosts. You were one of them.',
            'No messages, no presence, no reason to stay. Removed.',
            'You were a memory. Now you are forgotten.',
            'Activity is the price of membership. You stopped paying.'
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await sock.sendMessage(from, { text: `${randomQuote}\n\nRemoving inactive members:\n${inactive.map(j => `@${j.split('@')[0]}`).join('\n')}`, mentions: inactive }, { quoted: msg });

        try {
            await sock.groupParticipantsUpdate(from, inactive, "remove");
            await sock.sendMessage(from, { text: `✅ Kickinactive completed. Removed ${inactive.length} members.` }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Failed to kick some members: ${err.message}` }, { quoted: msg });
        }
    }
};
