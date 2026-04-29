const { jidNormalizedUser } = require("@whiskeysockets/baileys");

module.exports = {
    name: "approveall",
    description: "Approve all pending group join requests",
    category: "group", // This ensures it appears in your Group Menu category
    useLimit: true,
    async execute(sock, m, { from, isGroup, isAdmins, isBotAdmins, reply, metadata }) {
        try {
            // 🛡️ Security Check Layer
            if (!isGroup) return reply('This command is for groups only.');
            if (!isAdmins) return reply('Only admins can use this.');
            if (!isBotAdmins) return reply('I need to be an admin to approve requests.');

            // 🔍 Fetch pending participants
            const response = await sock.groupRequestParticipantsList(from);

            if (!response || response.length === 0) {
                return reply('There are no pending join requests in this group.');
            }

            // ⚡ Map JIDs and Approve
            const participants = response.map(user => user.jid);
            await sock.groupRequestParticipantsUpdate(from, participants, "approve");

            // ✅ Group Success Message
            reply(`⛓️ *SΛVΛGΞ-TECH STATUS*\nSuccessfully approved *${participants.length}* pending members.`);

            // 📝 Log to your private Session DM
            const logUser = jidNormalizedUser(sock.user.id);
            await sock.sendMessage(logUser, { 
                text: `⛓️ *SΛVΛGΞ-TECH ADMIN LOG*\n*Action:* Bulk Approval\n*Group:* ${metadata.subject}\n*Count:* ${participants.length}\n*Status:* Success ✅` 
            });

        } catch (err) {
            console.error("Approve All Error:", err);
            reply('Failed to process requests. Ensure "Approve New Participants" is ON in group settings.');
        }
    }
};
