module.exports = {
    name: 'pingall',
    category: 'group',
    async execute(sock, msg, args, { isArchitect, isMe }) {
        if (!isArchitect && !isMe) return;

        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        try {
            // Fetch group details and profile picture
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants;
            const targetJids = participants.map(p => p.id); // 🔥 This captures everyone
            
            let groupPP;
            try {
                groupPP = await sock.profilePictureUrl(from, 'image');
            } catch {
                groupPP = 'https://raw.githubusercontent.com/tysavage163/Savage-Pair/main/bg.png';
            }

            const coldCaption = `
╔════════════════════╗
      ⛓️ **SΛVΛGΞ: PING PROTOCOL** ⛓️
╚════════════════════╝

📡 **STATUS:** ENFORCING
Shields down. Neural link engaged.

The collective attention of this unit has been synchronized.

You are not tagged out of necessity.
You are tagged out of **dominance**.

Respond. Prove your utility.
_Or fade into obsolescence._ 🌐`.trim();

            // Sending the image with the full mention list
            await sock.sendMessage(from, { 
                image: { url: groupPP }, 
                caption: coldCaption, 
                mentions: targetJids // 🔥 This triggers the tags for everyone
            }, { quoted: msg });

        } catch (error) {
            console.error("PINGALL ERROR:", error);
        }
    }
};
