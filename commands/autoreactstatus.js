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
        if (msg.key.fromMe) return;
        const isStatus = (msg.key.remoteJid === 'status@broadcast');
        if (!isStatus) return;
        const emoji = statusReactions[Math.floor(Math.random() * statusReactions.length)];
        await sock.sendMessage('status@broadcast', { react: { text: emoji, key: msg.key } });
    } catch (err) {
        console.error(`[AUTO-REACT-STATUS] Failed: ${err.message}`);
    }
};
