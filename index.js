const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion,
    proto 
} = require("@whiskeysockets/baileys");
const fs = require('fs');
const P = require('pino');

// 1. GLOBAL SYSTEM SETTINGS
global.prefix = ".";            // ALWAYS starts as "." on every reboot
global.isPublic = true;         
global.antiDelete = "chat";     // Options: 'chat', 'private', 'off'
global.warnDatabase = {};       
global.msgStore = {};           
const supremeDeveloper = '254798841125@s.whatsapp.net'; // Spencer

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state,
        browser: ["Savage-Tech", "Chrome", "3.0.0"],
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    // --- 📡 CONNECTION MONITOR ---
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 CONNECTION LOST: REBOOTING...');
                startSavage();
            }
        } else if (connection === 'open') {
            console.log('┎──────────────────────────╼');
            console.log('┃ ✅ SAVAGE-TECH ONLINE');
            console.log(`┃ ⚡ DEFAULT PREFIX: ${global.prefix}`);
            console.log(`┃ 🕵️  ANTI-DELETE: ${global.antiDelete.toUpperCase()}`);
            console.log('┖──────────────────────────╼');
        }
    });

    // --- 📥 MESSAGE PROCESSING ENGINE ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return; 

            // 🧠 CACHE MESSAGE (For Anti-Delete)
            const msgId = msg.key.id;
            global.msgStore[msgId] = msg;
            if (Object.keys(global.msgStore).length > 500) delete global.msgStore[Object.keys(global.msgStore)[0]];

            const from = msg.key.remoteJid;
            const body = (
                msg.message.conversation || 
                msg.message.extendedTextMessage?.text || 
                msg.message.imageMessage?.caption || 
                msg.message.videoMessage?.caption || ""
            ).trim();

            // 🛠️ DYNAMIC PREFIX CHECK
            const isCmd = body.startsWith(global.prefix);
            if (!isCmd) return;

            const command = body.slice(global.prefix.length).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);

            const sender = msg.key.participant || msg.key.remoteJid;
            const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // BOSS CHECK (You / Host / Same Phone)
            const isBoss = (sender === supremeDeveloper || sender === localOwner || msg.key.fromMe);

            if (!global.isPublic && !isBoss) return;

            // 🚀 COMMAND HANDLER
            const path = `./commands/${command}.js`;
            if (fs.existsSync(path)) {
                delete require.cache[require.resolve(path)]; 
                const cmdFile = require(path);
                await cmdFile.execute(sock, msg, args);
            }
        } catch (err) { console.error("Runtime Error:", err); }
    });

    // --- 🗑️ ANTI-DELETE (TRI-STATE PROTOCOL) ---
    sock.ev.on('messages.update', async (updates) => {
        for (const update of updates) {
            if (update.update.protocolMessage?.type === proto.Message.ProtocolMessage.Type.REVOKE) {
                if (!global.antiDelete || global.antiDelete === 'off') return;

                const deletedMsgId = update.update.protocolMessage.key.id;
                const savedMsg = global.msgStore[deletedMsgId];

                if (savedMsg) {
                    const from = savedMsg.key.remoteJid;
                    const sender = savedMsg.key.participant || savedMsg.key.remoteJid;
                    const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                    
                    const report = `*🕵️ SAVAGE-TECH: DELETED DATA RECOVERED*`;

                    // OPTION: CHAT (Public)
                    if (global.antiDelete === 'chat') {
                        await sock.sendMessage(from, { text: report, mentions: [sender] });
                        await sock.sendMessage(from, { forward: savedMsg }, { quoted: savedMsg });
                    }

                    // OPTION: PRIVATE (Host)
                    if (global.antiDelete === 'private' && from !== localOwner) {
                        const hostReport = `🛰️ *SAVAGE-TECH LOG:* Deletion in [${from.split('@')[0]}] by @${sender.split('@')[0]}`;
                        await sock.sendMessage(localOwner, { text: hostReport, mentions: [sender] });
                        await sock.sendMessage(localOwner, { forward: savedMsg });
                    }
                }
            }
        }
    });
}

startSavage();
