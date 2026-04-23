const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

// This specific line fixes the "is not a function" error
const Baileys = require("@whiskeysockets/baileys");
const makeInMemoryStore = Baileys.makeInMemoryStore || require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore;

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");

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

    store.bind(sock.ev);

    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const phoneNumber = await new Promise(resolve => rl.question('\n📞 Enter Phone Number: ', resolve));
        rl.close();
        let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n🚀 YOUR PAIRING CODE: ${code?.match(/.{1,4}/g)?.join("-") || code}\n`);
    }

    sock.
