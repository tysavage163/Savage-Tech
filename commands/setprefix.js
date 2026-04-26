module.exports = {
    category: 'owner',
    name: "setprefix",
    async execute(sock, msg, args, { hasAccess }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;

        // 🛡️ SECURITY GATE
        if (!hasAccess) {
            return sock.sendMessage(from, { 
                text: "🚫 *ACCESS DENIED: Only the Architect or Host can reconfigure the neural trigger.*" 
            }, { quoted: msg });
        }

        // 🔍 INPUT VALIDATION
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: "⚠️ *SYSTEM NOTICE: Provide a new prefix symbol.*" 
            }, { quoted: msg });
        }

        // ⚙️ EXECUTE RECONFIGURATION
        const oldPrefix = global.prefix;
        const newPrefix = args[0];
        global.prefix = newPrefix;

        // 📊 BOXED TABLE DESIGN
        const responseText = `
┏━━━━━━━━━━━━━━━━━━━━┓
┃   ⚙️ *SYSTEM RECONFIG* ⚙️
┣━━━━━━━━━━━━━━━━━━━━┫
┃
┃ 🟢 *STATUS:* SUCCESS
┃ 📡 *OLD:* [ ${oldPrefix} ]
┃ ⚡ *NEW:* [ ${newPrefix} ]
┃ 👤 *AUTH:* @${sender.split('@')[0]}
┃
┗━━━━━━━━━━━━━━━━━━━━┛
        `.trim();

        await sock.sendMessage(from, { 
            text: responseText,
            mentions: [sender]
        }, { quoted: msg });

        console.log(`[SYSTEM] Prefix changed from ${oldPrefix} to ${newPrefix}`);
    }
};
