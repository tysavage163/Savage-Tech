let activeGroups = new Set(); 

module.exports = {
    name: 'welcome',
    category: 'group',
    desc: 'Toggle the welcome/goodbye sequence.',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        // Toggle logic
        if (activeGroups.has(from)) {
            activeGroups.delete(from);
            await sock.sendMessage(from, { text: "☢️ *PERIMETER SILENCED:* Auto-responses are **OFF**." });
        } else {
            activeGroups.add(from);
            await sock.sendMessage(from, { text: "☣️ *PERIMETER SECURED:* Auto-responses are **ON**." });
        }
    },
    isToggled: (groupId) => activeGroups.has(groupId)
};
