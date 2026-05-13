global.autoReact = global.autoReact || {};
global.autoReactGroups = global.autoReactGroups || false;
global.autoReactAll = global.autoReactAll || false;

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
        if (args.length === 0) {
            return sock.sendMessage(from, { text: "Usage: .autoreact chat on/off\n.autoreact groups on/off\n.autoreact all on/off\n.autoreact off" });
        }
        const first = args[0].toLowerCase();
        if (first === "off") {
            global.autoReactAll = false;
            global.autoReactGroups = false;
            if (global.autoReact) global.autoReact[from] = false;
            return sock.sendMessage(from, { text: "✅ Auto‑reaction disabled for this chat (and all groups/all chats)." });
        }
        const scope = first;
        const state = args[1]?.toLowerCase();
        if (!["chat", "groups", "all"].includes(scope) || !["on", "off"].includes(state)) {
            return sock.sendMessage(from, { text: "Usage: .autoreact chat on/off\n.autoreact groups on/off\n.autoreact all on/off" });
        }
        if (scope === "chat") {
            if (!global.autoReact) global.autoReact = {};
            global.autoReact[from] = state === "on";
            await sock.sendMessage(from, { text: `✅ Auto‑reaction in this chat: ${state.toUpperCase()}` });
        } else if (scope === "groups") {
            global.autoReactGroups = state === "on";
            await sock.sendMessage(from, { text: `✅ Auto‑reaction in ALL groups: ${state.toUpperCase()}` });
        } else if (scope === "all") {
            global.autoReactAll = state === "on";
            await sock.sendMessage(from, { text: `✅ Auto‑reaction in ALL chats (private and groups): ${state.toUpperCase()}` });
        }
    }
};

module.exports.reactToMessage = async function(sock, msg) {
    try {
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        if (msg.key.fromMe) return;
        let shouldReact = false;
        if (global.autoReactAll === true) {
            shouldReact = true;
        } else if (global.autoReactGroups === true && isGroup) {
            shouldReact = true;
        } else if (global.autoReact && global.autoReact[from] === true) {
            shouldReact = true;
        }
        if (!shouldReact) return;
        const emoji = reactions[Math.floor(Math.random() * reactions.length)];
        await sock.sendMessage(from, { react: { text: emoji, key: msg.key } });
    } catch (err) {}
};
