module.exports = {
    name: 'welcome',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // 1. Group Check
        if (!from.endsWith('@g.us')) return sock.sendMessage(from, { text: '❌ This is a group-only command.' });

        // 2. Admin Check
        const metadata = await sock.groupMetadata(from);
        const participants = metadata.participants;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isAdmin = participants.find(p => p.id === sender)?.admin;

        if (!isAdmin) return sock.sendMessage(from, { text: '❌ Only Admins can control the Welcome system.' }, { quoted: msg });

        // 3. Logic
        const status = args[0]?.toLowerCase();
        if (status === 'on') {
            // Note: This saves to a global variable. If you restart Termux, you may need to turn it back on 
            // unless your index.js has a permanent database (global.db).
            if (!global.db) global.db = { chats: {} };
            if (!global.db.chats[from]) global.db.chats[from] = {};
            
            global.db.chats[from].welcome = true;
            return sock.sendMessage(from, { text: "✅ *SΛVΛGΞ Welcome System: ACTIVATED*" }, { quoted: msg });
        } else if (status === 'off') {
            if (global.db?.chats?.[from]) global.db.chats[from].welcome = false;
            return sock.sendMessage(from, { text: "❌ *SΛVΛGΞ Welcome System: DEACTIVATED*" }, { quoted: msg });
        } else {
            return sock.sendMessage(from, { text: "Usage: *.welcome on* or *.welcome off*" }, { quoted: msg });
        }
    }
};
