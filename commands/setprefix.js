module.exports = {
    name: 'setprefix',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // 🆔 IDENTITY CHECK
        const supremeDeveloper = '254798841125@s.whatsapp.net'; // Spencer
        const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isBoss = (sender === supremeDeveloper || sender === localOwner || msg.key.fromMe);

        // 🛡️ PERMISSION GATE
        if (!isBoss) {
            return sock.sendMessage(from, { 
                text: "🚫 *ACCESS DENIED:* Only the Architect can reconfigure the neural trigger." 
            });
        }

        // 🔍 INPUT VALIDATION
        if (!args[0]) {
            return sock.sendMessage(from, { 
                text: `⚠️ *SYSTEM NOTICE:*\n\nCurrent Prefix: [ ${global.prefix} ]\nUsage: ${global.prefix}setprefix [symbol]\nExample: ${global.prefix}setprefix !` 
            });
        }

        // ⚙️ EXECUTE RECONFIGURATION
        const oldPrefix = global.prefix;
        const newPrefix = args[0];
        global.prefix = newPrefix;

        const responseText = `
┎──────────────────────────╼
┃   ⚙️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐑𝐄𝐂𝐎𝐍𝐅𝐈𝐆 ⚙️
┖──────────────────────────╼
┃
┃ 🟢 *STATUS:* SUCCESS
┃ 📡 *OLD PREFIX:* [ ${oldPrefix} ]
┃ ⚡ *NEW PREFIX:* [ ${newPrefix} ]
┃ 👤 *AUTH BY:* @${sender.split('@')[0]}
┃
┖──────────────────────────╼
`;

        await sock.sendMessage(from, { 
            text: responseText,
            mentions: [sender]
        }, { quoted: msg });
    }
};
