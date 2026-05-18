module.exports = {
    name: 'listactive',
    category: 'group',
    description: 'Rank active group members by messages sent',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ Group only command.' }, { quoted: msg });

        try {
            const meta = await sock.groupMetadata(from);
            const participants = meta.participants.map(p => p.id);
            const counts = global.messageCounts[from] || {};

            const active = participants
                .map(jid => ({ jid, count: counts[jid] || 0 }))
                .filter(user => user.count > 0)          // ⬅️ exclude inactive members
                .sort((a, b) => b.count - a.count);

            if (active.length === 0) {
                return sock.sendMessage(from, { text: '📊 No active members yet.' }, { quoted: msg });
            }

            const lines = active.map((user, idx) =>
                `${idx + 1}. @${user.jid.split('@')[0]} — ${user.count} msgs`
            ).join('\n');

            const text = `📊 *Activity Ranking in ${meta.subject}*\n👥 Active: ${active.length}\n\n${lines}\n\n┍━━━━━━━━━━━━━━━╼\n┃ 🚀 SΛVΛGΞ-TΞCH OS\n┕━━━━━━━━━━━━━━━╼`;

            await sock.sendMessage(from, { text, mentions: active.map(u => u.jid) }, { quoted: msg });
        } catch (err) {
            await sock.sendMessage(from, { text: `❌ Error: ${err.message}` }, { quoted: msg });
        }
    }
};
