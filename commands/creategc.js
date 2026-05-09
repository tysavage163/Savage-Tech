module.exports = {
    name: 'creategc',
    category: 'owner',
    description: 'Create a WhatsApp group (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });
        if (args.length < 1) return sock.sendMessage(from, { text: '❓ Usage: .creategc <group_name> [phone1,phone2,...]' });

        let groupName = args[0];
        if (/^\d+$/.test(groupName)) return sock.sendMessage(from, { text: '❌ Group name cannot be only numbers. Please use a proper name.' });

        let participants = [];
        if (args.length > 1) {
            const rest = args.slice(1).join(' ');
            const parts = rest.split(',');
            for (let p of parts) {
                p = p.trim();
                if (/^\+?\d+$/.test(p)) {
                    participants.push(p.replace(/[^0-9]/g, '') + '@s.whatsapp.net');
                } else if (p.includes('@s.whatsapp.net') || p.includes('@g.us')) {
                    participants.push(p);
                } else {
                    return sock.sendMessage(from, { text: `❌ Invalid participant: ${p}. Use phone number or JID.` });
                }
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
