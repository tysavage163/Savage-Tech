const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const Baileys = require("@whiskeysockets/baileys");
const makeInMemoryStore = Baileys.makeInMemoryStore || 
    (Baileys.default && Baileys.default.makeInMemoryStore) || 
    require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore;

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

const store = makeInMemoryStore({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
});

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

    if (!sock.authState.creds.registered) {
        console.log("\n🚀 PAIRING MODE (PHONE NUMBER)");
        const phoneNumber = await question("📞 Enter number (e.g. 2547XXXXXXXX): ");

        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(
                    phoneNumber.replace(/[^0-9]/g, '')
                );
                console.log(`\n🔥 PAIRING CODE: ${code.match(/.{1,4}/g).join("-")}\n`);
            } catch (err) {
                console.error("❌ Pairing error:", err);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // 🗑️ ANTIDELETE ENGINE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;

            const content = cachedMsg.message.conversation || 
                            cachedMsg.message.extendedTextMessage?.text || 
                            "Media Content (Image/Video/Voice)";
            const sender = jidNormalizedUser(key.participant || key.remoteJid);

            await sock.sendMessage(key.remoteJid, { 
                text: `🗑️ *ANTIDELETE ALERT*\n\n👤 *User:* @${sender.split('@')[0]}\n💬 *Msg:* ${content}`,
                mentions: [sender]
            });
        } catch (e) { console.error("Antidelete Error:", e); }
    });

    // 📩 CONNECTION & COMMAND HANDLER
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
            if (shouldReconnect) startSavage();
        } else if (connection === "open") {
            console.log("✅ SAVAGE-TECH CONNECTED & ANTIDELETE ACTIVE");
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
                    delete require.cache[require.resolve(`./commands/${file}`)];
                    const cmd = require(`./commands/${file}`);
                    if (cmd.name === command) {
                        return cmd.execute(sock, mek, args, { prefix, isOwner });
                    }
                }
            } catch (e) { console.error(e); }
        }
    });
}

startSavage();
