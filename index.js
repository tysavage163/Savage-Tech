const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const Baileys = require("@whiskeysockets/baileys");
let makeInMemoryStore;
try {
    makeInMemoryStore = Baileys.makeInMemoryStore || 
                       (Baileys.default && Baileys.default.makeInMemoryStore) || 
                       require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore;
} catch (e) {
    makeInMemoryStore = () => ({ bind: () => {}, loadMessage: () => {} });
}

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
let prefix = "!"; 

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

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
            const msg = await store.loadMessage(key.remoteJid, key.id);
            return msg?.message || undefined;
        }
    });

    store.bind(sock.ev);

    // 🚀 SMART PAIRING LOGIC
    if (!sock.authState.creds.registered) {
        console.log("\n🚀 PAIRING MODE ACTIVE");
        const phoneNumber = await question("📞 Enter number (e.g. 2547XXXXXXXX): ");
        
        // Wait for connection to be stable before asking for code
        sock.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open' || connection === 'connecting') {
                try {
                    // Small extra delay to ensure server readiness
                    await new Promise(r => setTimeout(r, 5000));
                    let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                    console.log(`\n🔥 YOUR CODE: ${code?.match(/.{1,4}/g)?.join("-") || code}\n`);
                } catch (err) {
                    // If it fails, it will retry on next update
                }
            }
        });
    }

    sock.ev.on('creds.update', saveCreds);

    // 🗑️ ANTIDELETE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;
            const content = cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage?.text || "Media Message";
            const sender = jidNormalizedUser(key.participant || key.remoteJid);
            await sock.sendMessage(key.remoteJid, { 
                text: `🗑️ *ANTIDELETE ALERT*\n👤 @${sender.split('@')[0]}\n💬 ${content}`,
                mentions: [sender]
            });
        } catch (e) { }
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startSavage();
        } else if (connection === "open") {
            console.log("✅ SAVAGE-TECH IS ONLINE");
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages?.[0];
        if (!mek || !mek.message || mek.key.fromMe) return;
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
                    if (cmd.name === command) return cmd.execute(sock, mek, args, { prefix, isOwner });
                }
            } catch (e) { }
        }
    });
}
startSavage();
