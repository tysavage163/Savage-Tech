global.autoReactStatus = global.autoReactStatus !== undefined ? global.autoReactStatus : false;

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
        console.log(`[AUTO-REACT-STATUS] Command toggled to ${global.autoReactStatus}`);
        await sock.sendMessage(from, { text: `✅ Auto‑reaction to status updates: ${state.toUpperCase()}` });
    }
};

module.exports.reactToStatus = async function(sock, msg) {
    try {
        const from = msg.key.remoteJid;
        if (from !== 'status@broadcast') return;
        if (msg.key.fromMe) return;
        console.log(`[AUTO-REACT-STATUS] Status received. Current flag: ${global.autoReactStatus}`);
        if (!global.autoReactStatus) return;
        const emoji = statusReactions[Math.floor(Math.random() * statusReactions.length)];
        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        console.log(`[AUTO-REACT-STATUS] Reacted with ${emoji}`);
    } catch (err) {
        console.error(`[AUTO-REACT-STATUS] Reaction error:`, err.message);
    }
};
