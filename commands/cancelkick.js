module.exports = {
    name: "cancelinactive",
    category: "group",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: 'Group only command.' });

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
        if (!isAdmin) return sock.sendMessage(from, { text: 'Only group admins can cancel kickinactive.' });

        if (!global.kickinactiveCancel) global.kickinactiveCancel = new Set();
        if (global.kickinactiveCancel.has(from)) {
            global.kickinactiveCancel.delete(from);
            await sock.sendMessage(from, { text: 'Kickinactive cancellation requested. Operation will be aborted.' });
        } else {
            await sock.sendMessage(from, { text: 'No active kickinactive operation in this group.' });
        }
    }
};
