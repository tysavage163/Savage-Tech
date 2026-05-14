// commands/autoreactstatus.js

global.autoReactStatus = global.autoReactStatus || false;

const statusReactions = [
    "🔥","⚡","💀","🧊","🚀","😈","😂","❤️","👀","🐐",
    "💯","🤖","😎","🥶","☠️","🫡","👑","🎯","🛸","🌙",
    "⭐","🌟","✨","💫","⚔️","🧠","🦅","🐉","🐺","🦂",
    "🍷","🍿","🎮","🎧","📱","💻","🖤","🤍","💜","💙",
    "💚","💛","🧡","❤️‍🔥","💥","☢️","🔱","🪬","🌀","🌪️",
    "🌊","🌋","⛈️","☄️","🌌","🪐","🌈","🍀","🎲","🎭",
    "🎪","🎨","🎤","🎼","🥷","🕶️","⌛","🕰️","📡","🛰️",
    "🚨","🛡️","🔮","🧿","🪙","💎","👻","🤡","😹","😤",
    "🥵","🥴","🤯","😵","🤠","🫠","🫥","🫣","🫨","🦾",
    "🦿","🫀","🧬","🧪","⚙️","🔋","💡","📀","🗿","☣️"
];

module.exports = {
    name: "autoreactstatus",
    category: "settings",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, {
                text: "❌ Owner only command."
            });
        }

        const state = args[0]?.toLowerCase();

        if (!["on", "off"].includes(state)) {
            return sock.sendMessage(from, {
                text: "Usage: .autoreactstatus on/off"
            });
        }

        global.autoReactStatus = state === "on";

        const quotesOn = [
            "Every status will now feel watched.",
            "Status reaction protocol activated.",
            "Silence on statuses has ended.",
            "The bot now reacts from the shadows.",
            "Every viewed story now leaves a trace."
        ];

        const quotesOff = [
            "Status reactions disabled.",
            "The bot has stopped haunting statuses.",
            "Reaction engine disconnected from stories.",
            "Status emotion module shut down.",
            "The shadows are silent again."
        ];

        const quote = state === "on"
            ? quotesOn[Math.floor(Math.random() * quotesOn.length)]
            : quotesOff[Math.floor(Math.random() * quotesOff.length)];

        await sock.sendMessage(from, {
            text:
`⚡ *AUTO-REACT STATUS*

📌 Status: ${state.toUpperCase()}

🧊 ${quote}

🎭 Loaded Emojis: ${statusReactions.length}

⚡ Powered by Savage Tech`
        });
    }
};

// ===== STATUS AUTO REACT =====

module.exports.reactToStatus = async function(sock, msg) {

    try {

        if (!global.autoReactStatus) return;

        const from = msg.key.remoteJid;

        if (from !== "status@broadcast") return;

        const emoji = statusReactions[
            Math.floor(Math.random() * statusReactions.length)
        ];

        await sock.sendMessage(from, {
            react: {
                text: emoji,
                key: msg.key
            }
        });

    } catch {}
};
