const antiDemote = new Map();

module.exports = {
  name: "antidemote",
  category: "group",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;

    if (!from.endsWith("@g.us")) {
      return sock.sendMessage(from, { text: "❌ Group only command." });
    }

    const sender = msg.key.participant || msg.key.remoteJid;
    const isAdmin = await global.checkAdmin?.(sock, from, sender) || false;

    if (!isAdmin) {
      return sock.sendMessage(from, { text: "🔒 Only group admins can use this." });
    }

    const state = args[0]?.toLowerCase();
    if (!["on", "off"].includes(state)) {
      return sock.sendMessage(from, { text: "Usage: .antidemote on/off" });
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
      text: `🚨 *ANTI-DEMOTE ALERT*\n\n👮 Action Blocked: Unauthorized Demotion Detected\n👤 Offender: @${author.split("@")[0]}\n\n⚠️ Result: Admin privileges revoked\n🛡️ Security System: ACTIVE\n\n⚡ Powered by Savage Tech`,
      mentions: [author]
    });
  }
};
