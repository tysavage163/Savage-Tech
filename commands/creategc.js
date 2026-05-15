module.exports = {
    name: 'creategc',
    category: 'owner',
    description: 'Create a WhatsApp group (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });
        if (args.length === 0) return sock.sendMessage(from, { text: '❓ Usage: .creategc <group_name (max 10 words)> [phone1 phone2 ...]' });

        const maxNameWords = 10;
        const groupNameWords = args.slice(0, maxNameWords);
        const groupName = groupNameWords.join(' ');
        const participantArgs = args.slice(maxNameWords);

        let participants = [];
        for (let p of participantArgs) {
            let cleaned = p.replace(/[^0-9]/g, '');
            if (cleaned) {
                participants.push(cleaned + '@s.whatsapp.net');
            } else {
                return sock.sendMessage(from, { text: `❌ Invalid phone number: ${p}. Use digits only.` });
            }
        }

        try {
            const group = await sock.groupCreate(groupName, participants);
            const groupJid = group.id;
            const inviteCode = await sock.groupInviteCode(groupJid);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            await sock.sendMessage(from, { text: `✅ Group created!\n📛 ${groupName}\n🆔 ${groupJid}\n🔗 ${inviteLink}\n👥 Added: ${participants.length}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼` });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` });
        }
    }
};
