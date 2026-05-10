// commands/vcf.js

module.exports = {
    category: 'group',
    name: 'vcf',
    description: 'Export group contacts as VCF or JSON',

    async execute(sock, msg, args, { isArchitect }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, {
                text: '❌ This command works in groups only.'
            });
        }

        const sender =
            msg.key.participant ||
            msg.participant ||
            msg.key.remoteJid;

        let isAdmin = false;

        try {
            const metadata = await sock.groupMetadata(from);

            const participant = metadata.participants.find(
                p => p.id === sender
            );

            isAdmin =
                participant?.admin === 'admin' ||
                participant?.admin === 'superadmin';

        } catch (e) {
            console.log(e);
        }

        if (!isAdmin && !isArchitect) {
            return sock.sendMessage(from, {
                text: '🔒 Admin/Owner only.'
            });
        }

        await sock.sendMessage(from, {
            text: '📥 Fetching group contacts...'
        });

        try {

            const metadata = await sock.groupMetadata(from);

            const participants = metadata.participants || [];

            if (!participants.length) {
                return sock.sendMessage(from, {
                    text: '❌ No participants found.'
                });
            }

            const mode =
                args[0]?.toLowerCase() === 'json'
                    ? 'json'
                    : 'vcf';

            const customPrefix =
                mode === 'json'
                    ? args[1]
                    : args[0];

            const emojis = [
                '🐺', '🔥', '⚡', '🛡️', '🎯',
                '🌙', '💀', '👑', '🦅', '🌟',
                '🦂', '🐉', '❄️', '🎩', '🏴',
                '🦎', '💫', '🧨', '🔱', '✨'
            ];

            const contacts = [];

            let count = 1;

            for (const participant of participants) {

                const jid = participant.id || '';

                // skip invalid IDs
                if (
                    jid.includes('lid') ||
                    jid.includes(':')
                ) {
                    continue;
                }

                let number = jid.split('@')[0];

                number = number.replace(/\D/g, '');

                if (
                    !number ||
                    number.length < 7
                ) {
                    continue;
                }

                const phone = `+${number}`;

                let username;

                if (customPrefix) {

                    const emoji =
                        emojis[
                            Math.floor(
                                Math.random() * emojis.length
                            )
                        ];

                    username =
                        `${emoji} ${customPrefix} ${count}`;

                } else {

                    username =
                        participant.notify ||
                        `Contact ${count}`;
                }

                contacts.push({
                    username,
                    phone
                });

                count++;
            }

            if (!contacts.length) {
                return sock.sendMessage(from, {
                    text: '❌ No valid phone numbers found.'
                });
            }

            // JSON EXPORT
            if (mode === 'json') {

                const jsonData = {
                    total: contacts.length,
                    contacts
                };

                const buffer = Buffer.from(
                    JSON.stringify(jsonData, null, 2),
                    'utf-8'
                );

                return await sock.sendMessage(
                    from,
                    {
                        document: buffer,
                        mimetype: 'application/json',
                        fileName: `${metadata.subject}_contacts.json`,
                        caption:
`╭─⌈ 📇 *JSON CONTACTS* ⌋
├─⊷ *Total:* ${contacts.length} contacts
╰─── *SAVAGE TECH* ───`
                    },
                    { quoted: msg }
                );
            }

            // BUILD VCF
            let vcf = '';

            for (const contact of contacts) {

                vcf +=
`BEGIN:VCARD
VERSION:3.0
FN:${contact.username}
TEL;TYPE=CELL:${contact.phone}
END:VCARD

`;
            }

            const buffer = Buffer.from(vcf, 'utf-8');

            const previewContacts = contacts.slice(0, 50);

            const previewText =
`╭─⌈ 📇 *VCF CONTACTS* ⌋
├─⊷ *Total:* ${contacts.length} contacts _(first ${previewContacts.length})_
╰─── *SAVAGE TECH* ───

\`\`\`json
${JSON.stringify({
    total: contacts.length,
    contacts: previewContacts
}, null, 2)}
\`\`\`

_...and ${contacts.length - previewContacts.length} more_`;

            await sock.sendMessage(
                from,
                {
                    document: buffer,
                    mimetype: 'text/vcard',
                    fileName: `${metadata.subject}_contacts.vcf`,
                    caption: previewText
                },
                { quoted: msg }
            );

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text:
`❌ Failed to export contacts.

Possible reasons:
• Bot is not admin
• WhatsApp privacy restrictions
• Invalid participant IDs

_⚡ Powered by Savage Tech_`
            });
        }
    }
};
