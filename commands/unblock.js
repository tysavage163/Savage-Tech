module.exports = {
    name: 'unblock',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;

        if (!isArchitect && !isMe) {
            return sock.sendMessage(from, { text: '❌ *Access Denied:* Only the Architect can use this.' }, { quoted: msg });
        }

        const target = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (args[0] ? args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        if (!target) {
            return sock.sendMessage(from, { text: '💡 *Usage:* Tag someone or provide their number to unblock.' }, { quoted: msg });
        }

        try {
            await sock.updateBlockStatus(target, "unblock");
            const unblockMsg = `
╔════◇ 【 **SΛVΛGΞ ЦПBLӨCK** 】 ◇════╗
║
┣┫ 👤 **TARGET:** @${target.split('@')[0]}
┣┫ ✅ **STATUS:** RESTORED
║
┣━━◇ 【 **ПӨƬΣ** 】 ◇━━┫
║
┣┫ ✨ Use your second chance 
┣┫    wisely. Don't waste it.
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: unblockMsg, mentions: [target] }, { quoted: msg });
        } catch (e) {
            console.log(e);
            return sock.sendMessage(from, { text: '❌ Error executing unblock.' }, { quoted: msg });
        }
    }
};
