// commands/vcf.js
module.exports = {
    category: 'group',
    name: 'vcf',
    description: 'Export all group members as VCF (vCard) or JSON (admin & owner only)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command can only be used in groups.' });
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
            } catch(e) {}
        }
        if (!isAdmin && !isArchitect) {
            return sock.sendMessage(from, { text: '🔒 Only group admins and the bot owner can export member contacts.' });
        }

        const format = args[0]?.toLowerCase() === 'json' ? 'json' : 'vcf';
        await sock.sendMessage(from, { text: `📥 Fetching group members...` });

        try {
            const metadata = await sock.groupMetadata(from);
            const participants = metadata.participants || [];
            if (participants.length === 0) {
                return sock.sendMessage(from, { text: '⚠️ No participants found.' });
            }

            const contacts = [];
            for (const p of participants) {
                let jid = p.id;
                let phone = jid.split('@')[0].replace(/[^0-9]/g, '');
                if (!phone) continue;
                phone = '+' + phone;
                let name = p.notify || phone;
                name = name.trim() || phone;
                contacts.push({ name, phone });
            }

            if (format === 'json') {
                const jsonData = JSON.stringify({
                    group: metadata.subject,
                    total: contacts.length,
                    contacts
                }, null, 2);
                const buffer = Buffer.from(jsonData, 'utf-8');
                await sock.sendMessage(from, {
                    document: buffer,
                    mimetype: 'application/json',
                    fileName: `${metadata.subject || 'group'}_contacts.json`
                });
                await sock.sendMessage(from, { text: `✅ Exported ${contacts.length} contacts as JSON.\n\n_⚡ Powered by Savage Tech_` });
            } else {
                let vcfString = '';
                for (const c of contacts) {
                    vcfString += `BEGIN:VCARD\nVERSION:3.0\nFN:${c.name}\nTEL;TYPE=CELL:${c.phone}\nEND:VCARD\n`;
                }
                const buffer = Buffer.from(vcfString, 'utf-8');
                await sock.sendMessage(from, {
                    document: buffer,
                    mimetype: 'text/vcard',
                    fileName: `${metadata.subject || 'group'}_contacts.vcf`
                });
                await sock.sendMessage(from, { text: `✅ Exported ${contacts.length} contacts as VCF.\n💡 Import this file into your phone contacts.\n\n_⚡ Powered by Savage Tech_` });
            }
        } catch (err) {
            console.error('vcf error:', err);
            await sock.sendMessage(from, { text: '❌ Failed to export contacts. Make sure I am an admin and can fetch group metadata.' });
        }
    }
};
