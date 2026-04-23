const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

// --- THE VAULT (Stores messages so they can be recovered if deleted) ---
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
                return msg.message || undefined;
            }
            return { conversation: "Savage-Tech Antidelete" };
        }
    });

    store.bind(sock.ev);

    // 🛰️ TERMINAL PAIRING
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const phoneNumber = await new Promise(resolve => rl.question('\n📞 Enter Phone Number: ', resolve));
        rl.close();
        let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n🚀 YOUR CODE: ${code?.match(/.{1,4}/g)?.join("-") || code}\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    // ✉️ MESSAGE & COMMAND HANDLER
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const mek = chatUpdate.messages[0];
        if (!mek.message || mek.key.fromMe) return;

        const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
        const sender = jidNormalizedUser(mek.key.participant || mek.key.remoteJid);
        
        // Command Logic
        if (body.startsWith(prefix)) {
            const args = body.slice(prefix.length).trim().split(/ +/);
            const command = args.shift().toLowerCase();
            const isOwner = sender.includes(sock.authState.creds.me.id.split(':')[0]);

            try {
                // This looks for your files: antidelete.js, warn.js, setprefix.js
                const cmdFile = fs.readdirSync('./commands').find(f => f === `${command}.js`);
                if (cmdFile) {
                    const runCmd = require(`./commands/${cmdFile}`);
                    await runCmd.execute(sock, mek, args, { prefix, isOwner });
                } else if (command === 'ping') {
                    await sock.sendMessage(mek.key.remoteJid, { text: "Savage-Tech Active ⚡" });
                }
            } catch (e) { console.error(e); }
        }
    });

    // 🗑️ ANTIDELETE ENGINE
    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cachedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (!cachedMsg) return;

            const content = cachedMsg.message.conversation || cachedMsg.message.extendedTextMessage?.text || "Media/System Message";
            const sender = jidNormalizedUser(key.participant || key.remoteJid);

            await sock.sendMessage(key.remoteJid, { 
                text: `🗑️ *ANTIDELETE*\n\n👤 *From:* @${sender.split('@')[0]}\n💬 *Message:* ${content}`,
                mentions: [sender]
            });
        } catch (e) { console.log("Antidelete error: ", e); }
    });

    sock.ev.on('connection.update', (up) => {
        if (up.connection === 'close') startSavage();
        if (up.connection === 'open') console.log('✅ SAVAGE-TECH ONLINE');
    });
}

startSavage();
