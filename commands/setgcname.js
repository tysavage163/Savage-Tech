module.exports = {
    category: 'tools',
    name: 'setgcname',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // Check if the command is being used in a group
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        const newName = args.join(' ');

        if (!newName) {
            return sock.sendMessage(from, { text: '❌ Please provide the new name for the group.\nExample: *.setgcname SΛVΛGΞ HQ*' }, { quoted: msg });
        }

        try {
            await sock.groupUpdateSubject(from, newName);
            sock.sendMessage(from, { text: `✅ Group name has been successfully changed to:\n*${newName}*` }, { quoted: msg });
        } catch (e) {
            console.log(e);
            sock.sendMessage(from, { text: '❌ Failed to change name. Make sure I am an Admin!' }, { quoted: msg });
        }
    }
};
