const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

// Versatile import for makeInMemoryStore to prevent TypeErrors
const Baileys = require("@whiskeysockets/baileys");
const makeInMemoryStore = Baileys.makeInMemoryStore || require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore;

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

// --- CORE ENGINE SETTINGS ---
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
let prefix = "!"; 

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        getMessage: async (key) => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
                return msg?.message || undefined;
            }
            return { conversation: "Savage-Tech System" };
        }
    });

    // Binds the store to the socket to enable Antidelete tracking
    store.bind(sock.ev);

    // 📡 PAIRING CODE INTERFACE
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const phoneNumber = await new Promise(resolve => rl.question('\n📞 Enter Phone Number: ', resolve));
        rl.close();
        let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n🚀 YOUR PAIRING CODE: ${code?.match(/.{1,4}/g)?.join("-") || code}\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    // ✉️ MESSAGE & COMMAND HANDLER (Handles warn, setprefix, etc.)
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message || mek.key.fromMe) return;

        const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
        const sender = jidNormalizedUser(mek.key.participant || mek.key.remoteJid);
        
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const isOwner = sender.includes(sock.authState.creds.me.id.split(':')[0]);

            try {
                // Scans the 'commands' folder for .js files
                const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const cmd = require(`./commands/${file}`);
                    if (cmd.name === command) {
                        return cmd.execute(sock, mek, args, { prefix, isOwner });
                    }
                }
            } catch (e) { console.error("Command execution error:", e); }
        }
    });

    // 🗑️ ANTIDELETE MODULE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;

            const content = cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage?.text || "Media Message";
            const sender = jidNormalizedUser(key.participant || key.remoteJid);

            await sock.sendMessage(key.remoteJid, { 
                text: `🗑️ *ANTIDELETE*\n\n👤 *User:* @${sender.split('@')[0]}\n💬 *Msg:* ${content}`,
                mentions: [sender]
            });
        } catch (e) { console.log("Antidelete error:", e); }
    });

    // 🔄 CONNECTION UPDATES
    sock.ev.on('connection.update', (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        } else if (connection === 'open') {
            console.log('✅ SAVAGE-TECH IS FULLY ONLINE');
        }
    });
}

startSavage();
