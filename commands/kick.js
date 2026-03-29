module.exports = {
    name: 'kick',
    async execute(sock, m, args) {
        // 1. Security Check: Only works in groups
        if (!m.key.remoteJid.endsWith('@g.us')) {
            return sock.sendMessage(m.key.remoteJid, { text: '❌ This command is strictly for Group environments.' });
        }

        // 2. Identify the Target
        const user = m.message.extendedTextMessage?.contextInfo?.participant || 
                     (args[0]?.replace('@', '') + '@s.whatsapp.net');

        if (!user || user.includes('undefined') || user.length < 10) {
            return sock.sendMessage(m.key.remoteJid, { text: '❌ *Target Required:* Mention the user or reply to their message.' });
        }

        // 3. SAVAGE KICK QUOTES - Cold and Final
        const kickQuotes = [
            "“Your subscription to this group has expired. Permanently.”",
            "“Don’t look back. You aren't going that way.”",
            "“Some people bring joy wherever they go; you bring joy whenever you leave.”",
            "“The trash has been successfully collected.”",
            "“You were a chapter. We are the whole book. Goodbye.”",
            "“Lions don't associate with sheep. Exit is that way. 🚪”",
            "“Your presence was a glitch in the system. Glitch removed.”",
            "“Silence is golden. Your absence is platinum.”",
            "“I don't have the energy to hate you, but I do have the energy to delete you.”"
        ];

        const randomQuote = kickQuotes[Math.floor(Math.random() * kickQuotes.length)];

        try {
            // 4. The Execution
            await sock.groupParticipantsUpdate(m.key.remoteJid, [user], "remove");

            // 5. The Flashy Exit Message
            const kickMessage = `┏━━━〔 *TERMINATION* 〕━━━┓\n` +
                                `┃ 👤 *TARGET:* @${user.split('@')[0]}\n` +
                                `┃ 🛠️ *STATUS:* REMOVED\n` +
                                `┗━━━━━━━━━━━━━━━━━━┛\n\n` +
                                `🔥 *SAVAGE NOTE:* \n_${randomQuote}_`;

            await sock.sendMessage(m.key.remoteJid, { 
                text: kickMessage, 
                mentions: [user] 
            });

        } catch (err) {
            await sock.sendMessage(m.key.remoteJid, { 
                text: '❌ *AUTHORITY ERROR:* Ensure I am a Group Admin to execute this command.' 
            });
        }
    }
};
