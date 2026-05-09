module.exports = {
    name: 'creategc',
    category: 'owner',
    description: 'Create a WhatsApp group (owner only)',
    async execute(sock, msg, args, { isMe }) {
        const from = msg.key.remoteJid;
        if (!isMe) return sock.sendMessage(from, { text: '❌ Owner only command.' });

        if (args.length < 1) {
            return sock.sendMessage(from, { text: '❓ Usage: .creategc <group_name> [phone1,phone2,...]' });
        }

        let groupName = args[0];
        let participants = [];
        
        // If there are more arguments, treat the rest as participants
        if (args.length > 1) {
            const participantsArg = args.slice(1).join(' ').split(',');
            for (let p of participantsArg) {
                p = p.trim();
                // Check if it's a phone number (digits only, with optional +)
                if (/^\+?\d+$/.test(p)) {
                    let clean = p.replace(/[^0-9]/g, '');
                    participants.push(`${clean}@s.whatsapp.net`);
                } else if (p.includes('@s.whatsapp.net') || p.includes('@g.us')) {
                    participants.push(p);
                } else {
                    return sock.sendMessage(from, { text: `❌ Invalid participant: ${p}. Use phone number or JID.` });
                }
            }
        }

        try {
            // Create the group
            const group = await sock.groupCreate(groupName, participants);
            const groupJid = group.id;
            const inviteCode = await sock.groupInviteCode(groupJid);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            
            await sock.sendMessage(from, {
                text: `✅ Group created successfully!\n\n📛 Name: ${groupName}\n🆔 Group JID: ${groupJid}\n🔗 Invite Link: ${inviteLink}\n👥 Participants added: ${participants.length}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`
            });
        } catch (err) {
            console.error('Create group error:', err);
            await sock.sendMessage(from, { text: `❌ Failed to create group: ${err.message}` });
        }
    }
};
