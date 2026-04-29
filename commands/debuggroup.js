module.exports = {
    name: 'debuggroup',
    category: 'owner',
    async execute(sock, msg) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Use in group.' });
        const group = await sock.groupMetadata(from);
        const botNumber = sock.user.id.split(':')[0].split('@')[0];
        const botFull = sock.user.id;
        const found = group.participants.find(p => p.id.includes(botNumber));
        const admins = group.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
        await sock.sendMessage(from, {
            text: `🤖 Bot ID: ${botFull}\n📱 Bot number: ${botNumber}\n✅ Found in group: ${found ? 'Yes' : 'No'}\n👑 Admin status: ${found?.admin || 'none'}\n👥 Admin list (first 10):\n${admins.slice(0,10).join('\n')}`
        });
    }
};
