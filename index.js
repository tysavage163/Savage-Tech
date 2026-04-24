const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const Baileys = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

const store = (Baileys.makeInMemoryStore || require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore)({ 
    logger: pino().child({ level: 'silent', stream: 'store' }) 
});

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
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    store.bind(sock.ev);

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question("\n📞 Enter Phone Number: ");
        console.log("⏳ Requesting code from WhatsApp...");
        
        // Short delay then force the request
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                console.log(`\n🔥 YOUR CODE: ${code}\n`);
            } catch (err) {
                console.log("\n❌ Error: Try running 'node .' again in 10 seconds.");
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // SIMPLE ANTIDELETE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;
            const content = cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage?.text || "Media Message";
            await sock.sendMessage(key.remoteJid, { text: `🗑️ *ANTIDELETE*\n\n💬 ${content}` });
        } catch (e) { }
    });

    sock.ev.on("connection.update", (up) => {
        if (up.connection === "open") console.log("✅ ONLINE");
        if (up.connection === "close") startSavage();
    });
}
startSavage();
