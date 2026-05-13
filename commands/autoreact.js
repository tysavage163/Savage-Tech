global.autoReact = global.autoReact || {};

const reactions = [
    "🔥","⚡","💀","🧊","🚀","😈","😂","❤️","👀","🐐",
    "💯","🤖","😎","🥶","☠️","🫡","👑","🎯","🛸","🌙",
    "⭐","🌟","✨","💫","⚔️","🧠","🦅","🐉","🐺","🦂",
    "🍷","🍿","🎮","🎧","📱","💻","🖤","🤍","💜","💙",
    "💚","💛","🧡","❤️‍🔥","💥","☢️","⚔","🔱","🪬","🌀",
    "🌪️","🌊","🌋","⛈️","☄️","🌌","🪐","🌈","🍀","🎲",
    "🎭","🎪","🎨","🎤","🎼","🥷","🕶️","⌛","🕰️","📡",
    "🛰️","🚨","🛡️","🔮","🧿","🪙","💎","👻","🤡","😹",
    "😤","🥵","🥴","🤯","😵","🤠","🫠","🫥","🫣","🫨",
    "🦾","🦿","🫀","🧬","🧪","⚙️","🔋","💡","📀","🗿",
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
    "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯",
    "🦁","🐮","🐷","🐸","🐒","🐔","🐧","🐦","🐤","🐣",
    "🐥","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌",
    "🐞","🐜","🪰","🪲","🪳","🐢","🐍","🦎","🐙","🦑",
    "🪼","🦐","🦞","🐠","🐟","🐡","🐬","🐳","🐋","🦈",
    "🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🎍",
    "🪴","🎋","🍃","🍂","🍁","🍄","🐚","🌾","🌺","🌻",
    "🌹","🥀","🌷","🌸","🌼","💐","🪸","🌎","🌍","🌏",
    "🪨","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙",
    "🌚","🌛","🌜","☀️","🌝","🌞","⭐","🌟","🌠","🪐",
    "💫","⚡","🔥","💥","☄️","💧","🌊","❄️","☃️","⛄",
    "🌬️","💨","🌀","🌪️","🌈","☔","☂️","🌂","💦","💨"
];

module.exports = {
    name: "autoreact",
    category: "owner",
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, { text: "❌ Owner only command." });
        }
        const state = args[0]?.toLowerCase();
        if (!["on", "off"].includes(state)) {
            return sock.sendMessage(from, { text: "Usage: .autoreact on/off" });
        }
        global.autoReact[from] = state === "on";
        const quotesOn = [
            "Every message now gets acknowledged.",
            "The bot is now emotionally unstable.",
            "Reaction protocol activated.",
            "Silence is no longer an option.",
            "Every text now triggers a response."
        ];
        const quotesOff = [
            "Reaction system disabled.",
            "The bot has stopped expressing feelings.",
            "Emoji engine shut down.",
            "Messages will now be ignored peacefully.",
            "Auto reactions terminated."
        ];
        const quote = state === "on"
            ? quotesOn[Math.floor(Math.random() * quotesOn.length)]
            : quotesOff[Math.floor(Math.random() * quotesOff.length)];
        await sock.sendMessage(from, {
            text: `⚡ *AUTO-REACT SYSTEM*\n\n📌 Status: ${state.toUpperCase()}\n\n🧊 ${quote}\n\n🎭 Emoji Pool: ${reactions.length} reactions loaded\n\n⚡ Powered by Savage Tech`
        });
    }
};

module.exports.reactToMessage = async function(sock, msg) {
    try {
        const from = msg.key.remoteJid;
        if (!global.autoReact?.[from]) return;
        if (msg.key.fromMe) return;
        const emoji = reactions[Math.floor(Math.random() * reactions.length)];
        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
        console.log(`[AUTO-REACT] Reacted ${emoji} to ${msg.key.id}`);
    } catch (err) {
        console.log(`[AUTO-REACT] Error: ${err.message}`);
    }
};
