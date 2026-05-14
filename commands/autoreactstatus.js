global.autoReactStatus = global.autoReactStatus === undefined ? false : global.autoReactStatus;

const statusReactions = [
    "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔",
    "❤️‍🔥","❤️‍🩹","💖","💗","💓","💞","💕","💟","❣️","💝",
    "😀","😃","😄","😁","😆","😅","😂","🤣","🥲","😊",
    "😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙",
    "😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎",
    "🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁",
    "😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡",
    "🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓",
    "🤗","🤔","🫣","🤭","🤫","🤥","😶","😐","😑","😬",
    "🫨","😴","🤤","😪","😵","🤐","🥴","🤢","🤮","🤧",
    "😷","🤒","🤕","🤑","🤠","😈","👿","👹","👺","🤡",
    "💩","👻","💀","☠️","👽","👾","🤖","🎃","😺","😸",
    "😹","😻","😼","😽","🙀","😿","😾","🙈","🙉","🙊",
    "💋","💌","💐","🌸","🌼","🌻","🌺","🌹","🥀","🌷",
    "⚡","🔥","💥","✨","🌟","⭐","🌙","☀️","🌈","☁️",
    "🎉","🎊","🎈","🎁","🎀","🪅","🪄","🧸","🍀","🌿"
];

module.exports = {
    name: "autoreactstatus",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, { text: "❌ Owner only command." });
        }
        const state = args[0]?.toLowerCase();
        if (!["on", "off"].includes(state)) {
            return sock.sendMessage(from, { text: "Usage: .autoreactstatus on/off" });
        }
        global.autoReactStatus = (state === "on");
        await sock.sendMessage(from, { text: `✅ Auto‑reaction to status updates: ${state.toUpperCase()}` });
    }
};

module.exports.reactToStatus = async function(sock, msg) {
    try {
        if (!global.autoReactStatus) return;
        if (msg.key.remoteJid !== "status@broadcast") return;
        const participant = msg.key.participant;
        if (!participant) return;

        const emoji = statusReactions[Math.floor(Math.random() * statusReactions.length)];
        await sock.sendMessage(participant, {
            react: { text: emoji, key: { remoteJid: "status@broadcast", id: msg.key.id, participant: msg.key.participant } }
        });

        console.log(`[AUTO-REACT-STATUS] SENT ${emoji} -> ${participant}`);
    } catch (err) {
        console.error("[AUTO-REACT-STATUS_ERROR]", err);
    }
};
