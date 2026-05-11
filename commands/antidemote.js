const antiDemote = new Map(); // groupId -> enabled

module.exports = {
  name: "antidemote",
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
        text: "Usage: .antidemote on/off"
      });
    }

    antiDemote.set(from, state === "on");

    return sock.sendMessage(from, {
      text: `🛡️ Anti-Demote is now ${state.toUpperCase()}`
    });
  },

  antiDemote,

  async onGroupParticipantsUpdate(sock, update) {
    const { id, action, author } = update;

    if (action !== "demote") return;
    if (!antiDemote.get(id)) return;

    const meta = await sock.groupMetadata(id);
    const admins = meta.participants.filter(p => p.admin).map(p => p.id);

    if (!admins.includes(author)) return;

    await sock.groupParticipantsUpdate(id, [author], "demote");

    await sock.sendMessage(id, {
      text:
`🚨 *ANTI-DEMOTE ALERT*

👮 Action Blocked: Unauthorized Demotion Detected
👤 Offender: @${author.split("@")[0]}

⚠️ Result: Admin privileges revoked
🛡️ Security System: ACTIVE

⚡ Powered by Savage Tech`,
      mentions: [author]
    });
  }
};
