const antiPromote = new Map();

module.exports = {
  name: "antipromote",
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
      return sock.sendMessage(from, { text: "Usage: .antipromote on/off" });
    }

    antiPromote.set(from, state === "on");

    return sock.sendMessage(from, {
      text: `🛡️ Anti-Promote is now ${state.toUpperCase()}`
    });
  },

  antiPromote,

  async onGroupParticipantsUpdate(sock, update) {
    const { id, action, participants, author } = update;
    if (action !== "promote") return;
    if (!antiPromote.get(id)) return;

    const meta = await sock.groupMetadata(id);
    const admins = meta.participants.filter(p => p.admin).map(p => p.id);
    if (!admins.includes(author)) return;

    for (const user of participants) {
      if (admins.includes(user)) {
        await sock.groupParticipantsUpdate(id, [author, user], "demote");
        await sock.sendMessage(id, {
          text: `🚨 *ANTI-PROMOTE ALERT*\n\n👮 Action Blocked: Unauthorized Promotion Detected\n👤 Offender: @${author.split("@")[0]}\n🎯 Target: @${user.split("@")[0]}\n\n⚠️ Result: Both users have been demoted\n🛡️ Security System: ACTIVE\n\n⚡ Powered by Savage Tech`,
          mentions: [author, user]
        });
      }
    }
  }
};
