module.exports = {
    name: "setprefix",
    category: "owner",
    description: "Change the global command trigger",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;

        // 🛡️ THE FIX: Only the Host (isMe) can change this
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: "🚫 **ACCESS DENIED:** Only the Architect can reconfigure the neural trigger." 
            }, { quoted: msg });
        }

        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `⚠️ **ERROR:** Provide a new prefix. (Current: ${global.prefix})` 
            }, { quoted: msg });
        }

        const newPrefix = args[0];
        global.prefix = newPrefix;

        await sock.sendMessage(from, { 
            text: `✅ **SYSTEM UPDATED:** Neural trigger changed to: [ ${newPrefix} ]` 
        }, { quoted: msg });
    }
};
