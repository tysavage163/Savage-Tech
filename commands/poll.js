module.exports = {
    name: 'poll',
    category: 'group',
    description: 'Create a poll. Usage: .poll "Question?" "Option1" "Option2" ...',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        try {
            const meta = await sock.groupMetadata(from);
            const senderNumber = sender.split('@')[0];
            const participant = meta.participants.find(p => p.id.split('@')[0] === senderNumber);
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
        } catch (e) {
            return sock.sendMessage(from, { text: '❌ Failed to verify admin status.' }, { quoted: msg });
        }
        if (!isAdmin) {
            return sock.sendMessage(from, { text: '🔒 Only group admins can create polls.' }, { quoted: msg });
        }

        if (args.length < 2) {
            return sock.sendMessage(from, { text: '⚠️ Usage: .poll "Question?" "Option1" "Option2" ["Option3"...]\nMinimum 2 options required.' }, { quoted: msg });
        }

        const parsed = [];
        let current = '';
        let inside = false;
        const full = args.join(' ');
        for (let i = 0; i < full.length; i++) {
            const c = full[i];
            if (c === '"') {
                if (inside) {
                    parsed.push(current);
                    current = '';
                    inside = false;
                } else {
                    inside = true;
                }
            } else if (inside) {
                current += c;
            }
        }
        if (parsed.length < 2) {
            return sock.sendMessage(from, { text: '❌ Invalid format. Use: .poll "Question" "Option1" "Option2"' }, { quoted: msg });
        }

        const question = parsed[0];
        const options = parsed.slice(1);
        if (options.length < 2) {
            return sock.sendMessage(from, { text: '❌ You need at least 2 options.' }, { quoted: msg });
        }
        if (options.length > 12) {
            return sock.sendMessage(from, { text: '❌ Maximum 12 options allowed.' }, { quoted: msg });
        }

        try {
            await sock.sendMessage(from, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1
                }
            }, { quoted: msg });
        } catch (err) {
            console.error('Poll error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to create poll. Make sure I am admin (polls require admin privileges in groups).' }, { quoted: msg });
        }
    }
};
