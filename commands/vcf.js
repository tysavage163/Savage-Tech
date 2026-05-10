// commands/vcf.js

module.exports = {
    category: 'group',
    name: 'vcf',
    description: 'Export group contacts as VCF',

    async execute(sock, msg, args, { isArchitect }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, {
                text: '❌ Group only command.'
            });
        }

        const sender =
            msg.key.participant ||
            msg.participant ||
            msg.key.remoteJid;

        let isAdmin = false;

        try {

            const metadata =
                await sock.groupMetadata(from);

            const participant =
                metadata.participants.find(
                    p =>
                        p.id === sender ||
                        p.jid === sender
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

            const metadata =
                await sock.groupMetadata(from);

            const participants =
                metadata.participants || [];

            if (!participants.length) {
                return sock.sendMessage(from, {
                    text: '❌ No participants found.'
                });
            }

            const emojis = [
                '🐺', '🔥', '⚡', '🛡️', '🎯',
                '🌙', '💀', '👑', '🦅', '🌟',
                '🦂', '🐉', '❄️', '🎩', '🏴',
                '🦎', '💫', '🧨', '🔱', '✨'
            ];

            const contacts = [];
            const usedNumbers = new Set();

            let count = 1;

            for (const participant of participants) {

                // IMPORTANT FIX
                const jid =
                    participant.jid ||
                    participant.id ||
                    '';

                if (!jid) continue;

                let number =
                    jid.split('@')[0];

                // remove device suffix
                if (number.includes(':')) {
                    number =
                        number.split(':')[0];
                }

                // digits only
                number =
                    number.replace(/\D/g, '');

                if (
                    !number ||
                    number.length < 7
                ) {
                    continue;
                }

                // skip duplicates
                if (usedNumbers.has(number)) {
                    continue;
                }

                usedNumbers.add(number);

                const emoji =
                    emojis[
                        Math.floor(
                            Math.random() *
                            emojis.length
                        )
                    ];

                contacts.push({
                    username:
                        `${emoji} Savage Tech ${count}`,
                    phone:
                        `+${number}`
                });

                count++;
            }

            if (!contacts.length) {
                return sock.sendMessage(from, {
                    text:
                        '❌ No valid contacts detected.'
                });
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

            const buffer =
                Buffer.from(vcf, 'utf-8');

            const preview =
                contacts.slice(0, 50);

            const caption =
`╭─⌈ 📇 *VCF CONTACTS* ⌋
├─⊷ *Total:* ${contacts.length} contacts _(first ${preview.length})_
╰─── *SAVAGE TECH* ───

\`\`\`json
${JSON.stringify({
    total: contacts.length,
    contacts: preview
}, null, 2)}
\`\`\`

_...and ${contacts.length - preview.length} more_`;

            await sock.sendMessage(
                from,
                {
                    document: buffer,
                    mimetype: 'text/vcard',
                    fileName:
                        `${metadata.subject}_contacts.vcf`,
                    caption
                },
                { quoted: msg }
            );

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text:
`❌ Failed to export contacts.

${err.message}`
            });
        }
    }
};
