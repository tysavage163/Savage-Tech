const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    makeInMemoryStore 
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");

// Initialize Memory Store for Antidelete
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
let prefix = "!"; 

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: true, // ✅ QR Code will now appear in Termux
        logger: pino({ level: "fatal" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"],
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: "Savage-Tech System" };
        }
    });

    store.bind(sock.ev);

    sock.ev.on('creds.update', saveCreds);

    // ✉️ COMMAND HANDLER (Antidelete, Warn, etc.)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message || mek.key.fromMe) return;

        const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
        const sender = jidNormalizedUser(mek.key.participant || mek.key.remoteJid);
        
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const isOwner = sender.includes(sock.authState.creds.me?.id.split(':')[0]);

            try {
                const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const cmd = require(`./commands/${file}`);
                    if (cmd.name === command) {
                        return cmd.execute(sock, mek, args, { prefix, isOwner });
                    }
                }
            } catch (e) { console.error(e); }
        }
    });

    // 🗑️ ANTIDELETE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;
            const content = cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage?.text || "Media Message";
            const sender = jidNormalizedUser(key.participant || key.remoteJid);
            await sock.sendMessage(key.remoteJid, { 
                text: `🗑️ *ANTIDELETE*\n👤 @${sender.split('@')[0]}\n💬 ${content}`,
                mentions: [sender]
            });
        } catch (e) { console.log(e); }
    });

    sock.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startSavage();
        } else if (connection === 'open') {
            console.log('✅ SAVAGE-TECH IS ONLINE');
        }
    });
}

startSavage();
