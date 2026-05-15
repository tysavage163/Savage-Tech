module.exports = {
    name: "kickall",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

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

        const metadata = await sock.groupMetadata(from);
        const targets = metadata.participants.filter(p => p.admin === null).map(p => p.id);

        if (targets.length === 0) return sock.sendMessage(from, { text: 'No non-admin members to kick.' });

        if (!global.kickallCancel) global.kickallCancel = new Set();
        global.kickallCancel.add(from);

        await sock.sendMessage(from, { text: `Kickall initiated. Will kick ${targets.length} members in 5 seconds. Type cancelkick to abort.` });

        let cancelled = false;
        const cancelCheck = setInterval(() => {
            if (!global.kickallCancel.has(from)) {
                cancelled = true;
                clearInterval(cancelCheck);
            }
        }, 500);

        await new Promise(resolve => setTimeout(resolve, 5000));
        clearInterval(cancelCheck);

        if (cancelled || !global.kickallCancel.has(from)) {
            global.kickallCancel.delete(from);
            return sock.sendMessage(from, { text: 'Kickall cancelled by admin.' });
        }

        global.kickallCancel.delete(from);
        await sock.sendMessage(from, { text: `Removing ${targets.length} members...` });

        for (let user of targets) {
            try {
                await sock.groupParticipantsUpdate(from, [user], "remove");
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {}
        }

        await sock.sendMessage(from, { text: `Kickall completed. Removed ${targets.length} members.` });
    }
};
