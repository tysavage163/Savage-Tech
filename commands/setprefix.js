module.exports = {
    name: "setprefix",
    category: "owner",
    description: "Change the global command trigger (use 'none' to remove prefix requirement)",
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;

        // Only the bot owner/host can change the prefix
        if (!isMe) {
            return sock.sendMessage(from, { 
                text: "🚫 **ACCESS DENIED:** Only the Architect can reconfigure the neural trigger." 
            }, { quoted: msg });
        }

        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `⚠️ **ERROR:** Provide a new prefix. (Current: ${global.prefix === "none" ? "none (no prefix required)" : global.prefix})` 
            }, { quoted: msg });
        }

        let newPrefix = args[0];
        let responseText = "";

        if (newPrefix.toLowerCase() === "none") {
            global.prefix = "none";
            responseText = "✅ **SYSTEM UPDATED:** Prefix requirement removed. Now you can use commands without any prefix (e.g., type `menu` instead of `.menu`).\n\n⚠️ Note: The bot will check the **first word** of every message for a valid command.";
        } else {
            global.prefix = newPrefix;
            responseText = `✅ **SYSTEM UPDATED:** Neural trigger changed to: [ ${newPrefix} ]`;
        }

        await sock.sendMessage(from, { text: responseText }, { quoted: msg });
    }
};
