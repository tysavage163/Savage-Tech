module.exports = {
    name: 'warn',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');

        // 1. GROUP CHECK
        if (!isGroup) {
            return sock.sendMessage(from, { text: "❌ *Access Denied.* This command can only be executed within a Group environment." });
        }

        // 2. AUTHORITY SCAN (Fetching Admins)
        const groupMetadata = await sock.groupMetadata(from);
        const participants = groupMetadata.participants;
        const admins = participants.filter(v => v.admin !== null).map(v => v.id);

        // Define Boss Hierarchy
        const supremeDeveloper = '254798841125@s.whatsapp.net'; // Spencer
        const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const isSenderAdmin = admins.includes(sender) || sender === supremeDeveloper || sender === localOwner || msg.key.fromMe;
        const isBotAdmin = admins.includes(localOwner);

        // 3. PERMISSION GATE
        if (!isSenderAdmin) {
            return sock.sendMessage(from, { text: "🚫 *SECURITY ALERT:* Only Admins can authorize a system warning." });
        }

        if (!isBotAdmin) {
            return sock.sendMessage(from, { text: "⚠️ *CONFIGURATION ERROR:* I require Admin privileges to execute warns or kicks." });
        }

        // 4. TARGET DETECTION (Reply or Tag)
        const target = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || 
                       msg.message.extendedTextMessage?.contextInfo?.participant;

        if (!target) {
            return sock.sendMessage(from, { text: "🔍 *TARGET NOT FOUND:* Tag a user or reply to their message to issue a warning." });
        }

        // 5. WARN DATABASE LOGIC
        if (!global.warnDatabase) global.warnDatabase = {};
        if (!global.warnDatabase[target]) global.warnDatabase[target] = 0;

        global.warnDatabase[target] += 1;
        const currentWarns = global.warnDatabase[target];
        const maxWarns = 3;

        // 6. EXECUTION (Kick or Warn)
        if (currentWarns >= maxWarns) {
            // Elimination
            await sock.groupParticipantsUpdate(from, [target], "remove");
            await sock.sendMessage(from, { 
                text: `┎──────────────────────────╼\n┃ 🚫 𝐄𝐋𝐈𝐌𝐈𝐍𝐀𝐓𝐈𝐎𝐍 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐄\n┖──────────────────────────╼\n┃\n┃ 👤 *TARGET:* @${target.split('@')[0]}\n┃ 📝 *REASON:* Limit reached (${currentWarns}/${maxWarns})\n┃ 🛠️ *ACTION:* Removed from Group\n┃\n┖──────────────────────────╼`, 
                mentions: [target] 
            });
            global.warnDatabase[target] = 0; // Reset after kick
        } else {
            // Strike Issue
            await sock.sendMessage(from, { 
                text: `┎──────────────────────────╼\n┃ ⚠️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐖𝐀𝐑𝐍𝐈𝐍𝐆\n┖──────────────────────────╼\n┃\n┃ 👤 *TARGET:* @${target.split('@')[0]}\n┃ 📊 *STRIKE:* ${currentWarns} / ${maxWarns}\n┃ ⚡ *STATUS:* Monitoring active\n┃\n┃ _Proceed with caution or face_\n┃ _automatic termination._\n┖──────────────────────────╼`, 
                mentions: [target] 
            });
        }
    }
};
