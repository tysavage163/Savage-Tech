module.exports = {
    category: 'group',
    name: 'block',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;

        // Only the Architect (You) or the Bot can use this
        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, { text: '❌ *Access Denied:* Only the Architect can use this.' }, { quoted: msg });
        }

        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        if (!target) {
            return sock.sendMessage(from, { text: '💡 *Usage:* Tag someone or provide their number to block.' }, { quoted: msg });
        }

        try {
            await sock.updateBlockStatus(target, "block");
            const blockMsg = `
╔════◇ 【 **SΛVΛGΞ BLӨCK** 】 ◇════╗
║
┣┫ 👤 **TARGET:** @${target.split('@')[0]}
┣┫ 🚫 **STATUS:** BLACKLISTED
║
┣━━◇ 【 **ЯΣΛSӨП** 】 ◇━━┫
║
┣┫ ✨ Access to this technology 
┣┫    has been permanently revoked.
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: blockMsg, mentions: [target] }, { quoted: msg });
        } catch (e) {
            console.log(e);
            return sock.sendMessage(from, { text: '❌ Error executing block.' }, { quoted: msg });
        }
    }
};
