module.exports = {
    name: "eval",
    category: "owner",
    description: "Execute JS code on the fly",
    async execute(sock, msg, args, { isMe }) {
        if (!isMe) return;

        const code = args.join(" ");
        if (!code) return;

        try {
            let evaled = await eval(code);
            if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
            await sock.sendMessage(msg.key.remoteJid, { text: `💻 **EVAL RESULT:**\n\n\`\`\`${evaled}\`\`\`` });
        } catch (err) {
            await sock.sendMessage(msg.key.remoteJid, { text: `❌ **EVAL ERROR:**\n\n\`\`\`${err}\`\`\`` });
        }
    }
};
