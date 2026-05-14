global.autoReactStatus = false;

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
    "🎉","🎊","🎈","🎁","🎀","🪅","🪄","🧸","🍀","🌿",
    "🍕","🍔","🍟","🌮","🌯","🍣","🍦","🍩","🍪","🎂",
    "🍰","🥧","🍫","🍬","🍭","🍷","🥂","🍻","🍺","🥃",
    "🏆","🥇","🥈","🥉","🎯","🎲","🎮","🎧","📱","💻",
    "🖥️","📷","🎥","📹","🔍","💡","🔋","🧲","🧪","⚙️",
    "🛠️","🔧","🔨","🪚","🪛","🧰","🗝️","🔑","🚪","🪞",
    "🪟","🧴","🧼","🧽","🧹","🧺","🧻","🚽","🚿","🛁",
    "🪒","🩹","🩺","💊","🧬","🩸","🦷","🦴","🧠","👁️",
    "👀","👄","👅","👂","🦻","👃","🫀","🫁","🦶","🦵",
    "👣","🧥","🥼","👔","👗","👘","🥻","🩱","🩲","🩳",
    "👙","👚","👛","👜","💼","🎒","👝","🧳","👓","🕶️",
    "🥽","👑","🎩","🧢","⛑️","💍","💎","🔮","🧿","🪙"
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
        global.autoReactStatus = state === "on";
        await sock.sendMessage(from, { text: `✅ Auto‑reaction to status updates: ${state.toUpperCase()}` });
    }
};

module.exports.reactToStatus = async function(sock, msg) {
    try {
        const from = msg.key.remoteJid;
        console.log(`[AUTO-REACT-STATUS] Received message from: ${from}`);
        if (!global.autoReactStatus) {
            console.log(`[AUTO-REACT-STATUS] Disabled globally`);
            return;
        }
        if (from !== 'status@broadcast') {
            console.log(`[AUTO-REACT-STATUS] Not a status broadcast, from: ${from}`);
            return;
        }
        if (msg.key.fromMe) {
            console.log(`[AUTO-REACT-STATUS] Own message, ignoring`);
            return;
        }
        const emoji = statusReactions[Math.floor(Math.random() * statusReactions.length)];
        console.log(`[AUTO-REACT-STATUS] Reacting ${emoji} to status ${msg.key.id}`);
        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        console.log(`[AUTO-REACT-STATUS] Reaction sent successfully`);
    } catch (err) {
        console.error(`[AUTO-REACT-STATUS] Error: ${err.message}`);
    }
};
