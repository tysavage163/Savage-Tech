module.exports = {
    name: "broadcast",
    category: "group",
    description: "Transmit a message to all joined groups",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Ensure there is a message to broadcast
        if (!args.length) {
            return await sock.sendMessage(from, { 
                text: "☣️ *SYSTEM ERROR:* No transmission data provided. Use: .broadcast [message]" 
            }, { quoted: msg });
        }

        const broadcastMsg = args.join(" ");
        const getGroups = await sock.groupFetchAllParticipating();
        const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1]);
        const groupIds = groups.map((v) => v.id);

        await sock.sendMessage(from, { 
            text: `📡 *INITIATING BROADCAST...*\nTargeting ${groupIds.length} sectors.` 
        }, { quoted: msg });

        for (let id of groupIds) {
            await sock.sendMessage(id, { 
                text: `📢 **SΛVΛGΞ-TECH BROADCAST** 📢\n\n${broadcastMsg}\n\n_Sent by Beck via Engine_` 
            });
        }

        await sock.sendMessage(from, { text: "✅ *TRANSMISSION COMPLETE.* All sectors updated." });
    }
};
