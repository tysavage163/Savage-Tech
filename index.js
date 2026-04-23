const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const fs = require("fs");
const readline = require("readline");

let prefix = "!"; 
// This will store the owner number dynamically after pairing
let ownerNumber = ""; 

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Savage-Tech", "Chrome", "3.0.0"]
    });

    // 🛰️ DYNAMIC TERMINAL INPUT (No Hardcoding)
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const question = (text) => new Promise((resolve) => rl.question(text, resolve));
        
        console.log("\n--- SAVAGE-TECH SECURE DEPLOYMENT ---");
        const phoneNumber = await question('📞 Enter Phone Number to Link (e.g. 254...): ');
        ownerNumber = phoneNumber.replace(/[^0-9]/g, ''); // Store it
        rl.close(); 

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(ownerNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n✅ PAIRING CODE: ${code}\n`);
            } catch (err) {
                console.error("Pairing Error:", err);
            }
        }, 3000);
    } else {
        // If already registered, get owner from creds
        ownerNumber = sock.authState.creds.me.id.split(':')[0];
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        const mek = m.messages[0];
        if (!mek.message || mek.key.fromMe) return;

        const sender = jidNormalizedUser(mek.key.remoteJid);
        const senderNumber = sender.split('@')[0];
        const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
        
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        
        // 🛡️ SECURITY: Only the paired number is the Owner
        const isOwner = senderNumber === ownerNumber;

        try {
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const cmd = require(`./commands/${file}`);
                if (cmd.name === commandName) {
                    if (cmd.isSudo && !isOwner) {
                        return sock.sendMessage(sender, { text: "❌ Access Denied: Owners Only." });
                    }
                    return cmd.execute(sock, mek, args, { prefix, isOwner });
                }
            }

            // Built-in Owner Commands
            if (commandName === 'setprefix' && isOwner) {
                prefix = args[0] || prefix;
                await sock.sendMessage(sender, { text: `✅ Prefix set to: ${prefix}` });
            }
        } catch (e) {
            console.error(e);
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            ownerNumber = sock.authState.creds.me.id.split(':')[0];
            console.log(`🚀 ONLINE: Logged in as ${ownerNumber}`);
        } else if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startSavage();
        }
    });
}

startSavage();
