// Local memory to store which groups have the sequence active
let activeGroups = new Set(); 

module.exports = {
    name: 'welcome',
    category: 'group',
    desc: 'Toggle the welcome/goodbye sequence for this sector.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        // Check for Admin/Owner clearance
        const metadata = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.find(p => p.id === sender)?.admin !== null;
        const isOwner = sender === '254798841125@s.whatsapp.net';

        if (!isAdmin && !isOwner) {
            return sock.sendMessage(from, { text: "❌ *Access Denied.* Only those with high clearance can toggle the perimeter." });
        }

        if (activeGroups.has(from)) {
            activeGroups.delete(from);
            await sock.sendMessage(from, { text: "☢️ *PERIMETER SILENCED:* Welcome/Goodbye sequences are now **OFF**." });
        } else {
            activeGroups.add(from);
            await sock.sendMessage(from, { text: "☣️ *PERIMETER SECURED:* Welcome/Goodbye sequences are now **ON**." });
        }
    },
    // This allows index.js to check if the group is "ON"
    isToggled: (groupId) => activeGroups.has(groupId)
};
