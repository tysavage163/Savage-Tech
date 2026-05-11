const antiPromote = new Map(); // groupId -> enabled

module.exports = {
  name: "antipromote",
  category: "group",

  async execute(sock, msg, args, { isArchitect }) {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ Group only command." });
    }

    if (!isArchitect) {
      return sock.sendMessage(from, { text: "❌ Only owner can use this." });
    }

    const state = args[0]?.toLowerCase();

    if (!["on", "off"].includes(state)) {
      return sock.sendMessage(from, {
        text: "Usage: .antipromote on/off"
      });
    }

    antiPromote.set(from, state === "on");

    return sock.sendMessage(from, {
      text: `🛡️ Anti-Promote is now ${state.toUpperCase()}`
    });
  },

  antiPromote,

  async onGroupParticipantsUpdate(sock, update) {
    const { id, participants, action, author } = update;

    if (action !== "promote") return;
    if (!antiPromote.get(id)) return;

    const meta = await sock.groupMetadata(id);
    const admins = meta.participants.filter(p => p.admin).map(p => p.id);

    if (!admins.includes(author)) return;

    for (const user of participants) {
      if (admins.includes(user)) {
        await sock.groupParticipantsUpdate(id, [author, user], "demote");

        await sock.sendMessage(id, {
          text:
`🚨 *ANTI-PROMOTE ALERT*

👮 Action Blocked: Unauthorized Promotion Detected
👤 Offender: @${author.split("@")[0]}
🎯 Target: @${user.split("@")[0]}

⚠️ Result: Both users have been demoted
🛡️ Security System: ACTIVE

⚡ Powered by Savage Tech`,
          mentions: [author, user]
        });
      }
    }
  }
};
