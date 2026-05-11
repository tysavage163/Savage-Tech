
module.exports = {
    name: "listvcf",
    category: "group",

    async execute(sock, msg, args, { isArchitect, isMe }) {

        const from = msg.key.remoteJid;

        if (!from.endsWith("@g.us")) {
            return sock.sendMessage(from, {
                text: "❌ Group only command."
            });
        }

        const sender = msg.key.participant || msg.key.remoteJid;

        let isAdmin = false;

        try {

            const meta = await sock.groupMetadata(from);

            const participant = meta.participants.find(
                p =>
                    p.id === sender ||
                    p.jid === sender
            );

            isAdmin =
                participant?.admin === "admin" ||
                participant?.admin === "superadmin";

        } catch {}

        if (!isAdmin && !isArchitect && !isMe) {

            return sock.sendMessage(from, {
                text: "🔒 Admins & owner only."
            });
        }

        try {

            await sock.sendMessage(from, {
                text: "📥 Loading full contact database..."
            });

            const meta = await sock.groupMetadata(from);

            const participants = meta.participants || [];

            if (!participants.length) {

                return sock.sendMessage(from, {
                    text: "❌ No contacts found."
                });
            }

            let text =
`╭─⌈ 📇 *FULL VCF DIRECTORY* ⌋
├─⊷ *Group:* ${meta.subject}
├─⊷ *Total:* ${participants.length} contacts
╰─── *SAVAGE TECH* ───

`;

            let count = 1;

            for (const p of participants) {

                const jid =
                    p.jid ||
                    p.id ||
                    "";

                let number = jid.split("@")[0]
                    .replace(/[^0-9]/g, "");

                if (!number || number.length < 7) {
                    continue;
                }

                text +=
`*${count}.* ⚡ Savage Tech ${count}
📞 +${number}

`;

                count++;
            }

            text += `⚡ Powered by Savage Tech`;

            // WhatsApp message limit protection
            if (text.length > 65000) {

                const chunks = [];

                while (text.length > 0) {
                    chunks.push(text.slice(0, 60000));
                    text = text.slice(60000);
                }

                for (const chunk of chunks) {
                    await sock.sendMessage(from, {
                        text: chunk
                    });
                }

            } else {

                await sock.sendMessage(from, {
                    text
                });
            }

        } catch (err) {

            console.log(err);

            await sock.sendMessage(from, {
                text: "❌ Failed to generate VCF list."
            });
        }
    }
};
