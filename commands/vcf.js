// commands/vcf.js

module.exports = {
    category: 'group',
    name: 'vcf',
    description: 'Export group contacts into VCF',

    async execute(sock, msg, args, { isArchitect }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, {
                text: '❎ This command can only be used inside groups.'
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

        } catch (err) {
            console.log(err);
        }

        if (!isAdmin && !isArchitect) {
            return sock.sendMessage(from, {
                text: '🔐 Only admins or bot owner can use this command.'
            });
        }

        await sock.sendMessage(from, {
            text: '📡 Collecting group members...'
        });

        try {

            const metadata =
                await sock.groupMetadata(from);

            const participants =
                metadata.participants || [];

            if (!participants.length) {
                return sock.sendMessage(from, {
                    text: '⚠️ Group members could not be loaded.'
                });
            }

            const symbols = [
                '⚡', '🔥', '🌙', '🛡️', '👑',
                '🎯', '🦅', '❄️', '🐉', '✨',
                '🌟', '💀', '🔱', '🦂', '🏴'
            ];

            const contacts = [];
            const cache = new Set();

            let index = 1;

            for (const participant of participants) {

                const jid =
                    participant.jid ||
                    participant.id ||
                    '';

                if (!jid) continue;

                let number =
                    jid.split('@')[0];

                if (number.includes(':')) {
                    number =
                        number.split(':')[0];
                }

                number =
                    number.replace(/\D/g, '');

                if (
                    !number ||
                    number.length < 7
                ) {
                    continue;
                }

                if (cache.has(number)) {
                    continue;
                }

                cache.add(number);

                const icon =
                    symbols[
                        Math.floor(
                            Math.random() *
                            symbols.length
                        )
                    ];

                contacts.push({
                    name:
                        `${icon} Savage Tech ${index}`,
                    phone:
                        `+${number}`
                });

                index++;
            }

            if (!contacts.length) {
                return sock.sendMessage(from, {
                    text: '❌ No exportable contacts found.'
                });
            }

            let vcfData = '';

            for (const user of contacts) {

                vcfData +=
`BEGIN:VCARD
VERSION:3.0
FN:${user.name}
TEL;TYPE=CELL:${user.phone}
END:VCARD

`;
            }

            const fileBuffer =
                Buffer.from(vcfData, 'utf-8');

            const preview =
                contacts.slice(0, 30);

            const message =
`╭━━━〔 📇 VCF EXPORT 〕━━━⬣
┃ 👥 Contacts : ${contacts.length}
┃ 📦 Format   : VCF
┃ 🏷️ Group    : ${metadata.subject}
╰━━━━━━━━━━━━━━━━⬣

📜 *Preview Contacts*

\`\`\`json
${JSON.stringify(preview, null, 2)}
\`\`\`

_...and ${contacts.length - preview.length} more_

⚡ Powered by *Savage Tech*`;

            await sock.sendMessage(
                from,
                {
                    document: fileBuffer,
                    mimetype: 'text/vcard',
                    fileName:
                        `${metadata.subject}_SavageTech.vcf`,
                    caption: message
                },
                { quoted: msg }
            );

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text:
`❌ Failed to generate VCF file.

Reason:
${err.message}

⚡ Powered by *Savage Tech*`
            });
        }
    }
};
