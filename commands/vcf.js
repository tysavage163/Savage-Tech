// commands/vcf.js
module.exports = {
    category: 'group',
    name: 'vcf',
    description: 'Export group members as VCF or JSON (admin & owner only)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ Group only.' });
        }
        const sender = msg.key.participant || msg.key.remoteJid;
        let isAdmin = false;
        if (typeof global.checkAdmin === 'function') {
            isAdmin = await global.checkAdmin(sock, from, sender);
        } else {
            try {
                const meta = await sock.groupMetadata(from);
                const participant = meta.participants.find(p => p.id === sender);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            } catch (e) {}
        }
        if (!isAdmin && !isArchitect) {
            return sock.sendMessage(from, { text: '🔒 Admins & owner only.' });
        }
        const format = args[0] === 'json' ? 'json' : 'vcf';
        const prefix = args[1] || null;
        await sock.sendMessage(from, { text: `📥 Fetching members...` });
        try {
            const meta = await sock.groupMetadata(from);
            const participants = meta.participants || [];
            if (!participants.length) {
                return sock.sendMessage(from, { text: '⚠️ No members found.' });
            }
            const contacts = [];
            let idx = 1;
            for (const p of participants) {
                let jid = p.id;
                let rawPhone = jid.split('@')[0].replace(/[^0-9]/g, '');
                let phone = rawPhone ? '+' + rawPhone : 'Number hidden';
                let name = '';
                if (prefix) {
                    name = `${prefix} ${idx++}`;
                } else {
                    name = p.notify || (phone !== 'Number hidden' ? phone : jid.split('@')[0]);
                    name = name.trim() || phone;
                }
                contacts.push({ name, phone });
            }
            if (format === 'json') {
                const jsonData = JSON.stringify({
                    group: meta.subject,
                    total: contacts.length,
                    contacts
                }, null, 2);
                const buffer = Buffer.from(jsonData, 'utf-8');
                await sock.sendMessage(from, {
                    document: buffer,
                    mimetype: 'application/json',
                    fileName: `${meta.subject || 'group'}_contacts.json`
                });
                await sock.sendMessage(from, { text: `✅ Exported ${contacts.length} contacts as JSON.\n\n_⚡ Powered by Savage Tech_` });
            } else {
                let vcf = '';
                for (const c of contacts) {
                    vcf += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;TYPE=CELL:${c.phone}\nEND:VCARD\n`;
                }
                const buffer = Buffer.from(vcf, 'utf-8');
                await sock.sendMessage(from, {
                    document: buffer,
                    mimetype: 'text/vcard',
                    fileName: `${meta.subject || 'group'}_contacts.vcf`
                });
                await sock.sendMessage(from, { text: `✅ Exported ${contacts.length} contacts as VCF.\n💡 Import to phone.\n\n_⚡ Powered by Savage Tech_` });
            }
        } catch (err) {
            console.error(err);
            await sock.sendMessage(from, { text: '❌ Export failed. Ensure bot is admin.' });
        }
    }
};
