const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

module.exports = {
    category: 'group',
    name: 'setgcicon',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const dev = '254798841125@s.whatsapp.net';

        // 1. Security: Architect/Host Only
        if (sender !== dev && !msg.key.fromMe) return;

        // 2. Group Check
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command is restricted to Groups.' }, { quoted: msg });
        }

        try {
            // 3. Bot Admin Check (Required to change icons)
            const metadata = await sock.groupMetadata(from);
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            const isBotAdmin = metadata.participants.find(p => p.id === botId)?.admin;

            if (!isBotAdmin) {
                return sock.sendMessage(from, { text: '❌ *Execution Failed:* I need Admin rights to change the group icon.' }, { quoted: msg });
            }

            // 4. Quoted Image Check
            const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMessage = quoted?.imageMessage || msg.message?.imageMessage;

            if (!imageMessage) {
                return sock.sendMessage(from, { text: '💡 *Usage:* Reply to an image with `.setgcicon`' }, { quoted: msg });
            }

            await sock.sendMessage(from, { text: '🔄 *SΛVΛGΞ-TECH:* Recoding territory visuals...' }, { quoted: msg });

            // 5. Download and Process
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 6. Update Group Icon
            await sock.updateProfilePicture(from, buffer);

            const successMsg = `
╔════◇ 【 **SΛVΛGΞ UPDΛƬΣ** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Icon Synchronized
┣┫ ⚖️ **STATUS:** Identity Established
║
┣━━◇ 【 **VΣЯDICƬ** 】 ◇━━┫
║
┣┫ *The visual code has been*
┣┫ *rewritten. Territory updated.*
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

            await sock.sendMessage(from, { text: successMsg }, { quoted: msg });

        } catch (e) {
            console.log(e);
            return sock.sendMessage(from, { text: '❌ *System Error:* Failed to update identity.' }, { quoted: msg });
        }
    }
};
