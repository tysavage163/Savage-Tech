module.exports = {
    category: 'tools',
    name: 'admin',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        
        // Cold quote for the power-hungry
        const savageLine = "Authority isn't given, it's taken. Here are your weapons.";

        const text = `
*───「 SAVAGE-ADMIN 」───*
"${savageLine}"

*⚔️ POWER TOOLS:*
• .kick
• .promote
• .demote
• .hidetag
• .tagall
• .setgdesc
• .block
• .unblock
• .cls (Clear Session)

_Use with precision. Power is a double-edged sword._`;

        await sock.sendMessage(from, { 
            image: { url: 'https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/e91b4f95-67b1-4819-b737-b033df5d7e3b.jpg' }, 
            caption: text 
        }, { quoted: msg });
    }
};
