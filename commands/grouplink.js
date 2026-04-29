module.exports = {
    name: 'grouplink',
    category: 'group',
    description: 'Get group invite link and icon',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only.' });

        const group = await sock.groupMetadata(from);
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = group.participants.some(p => p.id === sender && (p.admin === 'admin' || p.admin === 'superadmin'));
        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only admins can use this.' });

        try {
            const inviteCode = await sock.groupInviteCode(from);
            const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
            let icon = null;
            try {
                const ppUrl = await sock.profilePictureUrl(from, 'image');
                icon = { url: ppUrl };
            } catch {}

            // 20+ Savage quotes
            const quotes = [
                "Every dream on track. 🎵",
                "Stay savage, never average.",
                "Silence speaks when words fail.",
                "In a world full of trends, be a classic.",
                "Your only limit is your mind.",
                "Pain is temporary, glory is forever.",
                "Don't chase, attract. Don't beg, command.",
                "Savage by nature, king by choice.",
                "They didn't believe in me – watch me prove them wrong.",
                "Hustle until your haters ask if you're hiring.",
                "Born to stand out, not to fit in.",
                "Victory loves preparation.",
                "Confidence is silent. Insecurities are loud.",
                "Legends are made when opportunity meets preparation.",
                "Keep your circle small and your goals large.",
                "The same fire that melts butter hardens steel.",
                "Act like you've been there before.",
                "Your vibe attracts your tribe.",
                "No pressure, no diamonds.",
                "Be a voice, not an echo.",
                "Wake up. Grind. Repeat. Dominate."
            ];
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

            // Savage watermark
            const watermark = `╭━━━━━━━━━━━━━━━╮\n┃ 🔥 𝕾𝕬𝖁𝕬𝕲𝕰 𝕭𝖔𝖙 🔥\n╰━━━━━━━━━━━━━━━╯`;
            const caption = `🔗 *Group Invite Link:*\n${inviteLink}\n\n📛 *Group:* ${group.subject}\n⏳ *Valid for 72 hours*\n\n💬 *Savage Quote:*\n“${randomQuote}”\n\n${watermark}`;

            if (icon) {
                await sock.sendMessage(from, { image: icon, caption });
            } else {
                await sock.sendMessage(from, { text: caption });
            }
        } catch (error) {
            console.error(error);
            await sock.sendMessage(from, { text: '❌ Failed to get link. Ensure I am admin and group allows links.' });
        }
    }
};
