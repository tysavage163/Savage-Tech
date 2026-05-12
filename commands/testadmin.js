module.exports = {
    name: 'testadmin',
    category: 'owner',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const participant = meta.participants.find(p => p.id === sender);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            await sock.sendMessage(from, { text: `Sender: ${sender}\nIs admin: ${isAdmin}\nParticipant object: ${JSON.stringify(participant)}` });
        } catch (err) {
            await sock.sendMessage(from, { text: `Error: ${err.message}` });
        }
    }
};
