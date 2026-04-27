module.exports = {
    name: "add",
    category: "group",
    description: "Add a user by number",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const input = args[0]?.replace(/[^0-9]/g, '');
        if (!input) return sock.sendMessage(from, { text: "👤 *SΛVΛGΞ:* Provide a number. (e.g. .add 254...)" });

        try {
            const jid = input + '@s.whatsapp.net';
            // Using the precise socket update for participants
            await sock.groupParticipantsUpdate(from, [jid], "add");
            await sock.sendMessage(from, { text: `✅ **SΛVΛGΞ:** User +${input} added.` });
        } catch (e) {
            await sock.sendMessage(from, { text: "❌ **FAIL:** Check if I am Admin or if the number is valid." });
        }
    }
};
