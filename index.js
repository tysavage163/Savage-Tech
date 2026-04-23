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

// --- GLOBAL CONFIGURATION ---
let prefix = "!"; 
let sudoNumbers = ["254XXXXXXXXX"]; // Add your number here

async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false, // 🛡️ NO QR - Perfect for Panels
        logger: pino({ level: "fatal" }),
        browser: ["Savage-Tech", "Chrome", "3.0.0"]
    });

    // 🛰️ UNIVERSAL PAIRING LOGIC
    if (!sock.authState.creds.registered) {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        const question = (text) => new Promise((resolve) => rl.question(text, resolve));
        
        console.log("\n📡 INITIALIZING UNIVERSAL DEPLOYMENT...");
        const phoneNumber = await question('📞 Enter Phone Number (e.g. 254123456789): ');
        const cleanedNumber = phoneNumber.replace(/[^0-9]/g, '');
        rl.close(); 

        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(cleanedNumber);
                code = code?.match(/.{1,4}/g)?.join("-") || code;
                console.log(`\n✅ YOUR PAIRING CODE: ${code}\n`);
            } catch (err) {
                console.error("Pairing Error:", err);
            }
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    // ✉️ MESSAGE HANDLER (Supports !addsudo, !setprefix, etc.)
    sock.ev.on('messages.upsert', async (m) => {
        const mek = m.messages[0];
        if (!mek.message || mek.key.fromMe) return;

        const sender = jidNormalizedUser(mek.key.remoteJid);
        const body = (mek.message.conversation || mek.message.extendedTextMessage?.text || "").trim();
        
        if (!body.startsWith(prefix)) return;

        const args = body.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const isSudo = sudoNumbers.includes(sender.split('@')[0]);

        // --- COMMAND EXECUTION LOGIC ---
        try {
            // 1. Check commands folder
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const cmd = require(`./commands/${file}`);
                if (cmd.name === commandName) {
                    // Check if command is Sudo-only
                    if (cmd.isSudo && !isSudo) {
                        return sock.sendMessage(sender, { text: "❌ This command is for Sudoers only." });
                    }
                    return cmd.execute(sock, mek, args, { prefix, sudoNumbers });
                }
            }

            // 2. Built-in Core Commands (Fallbacks)
            if (commandName === 'setprefix' && isSudo) {
                prefix = args[0] || prefix;
                await sock.sendMessage(sender, { text: `✅ Prefix updated to: ${prefix}` });
            }
            
            if (commandName === 'addsudo' && isSudo) {
                const newSudo = args[0]?.replace(/[^0-9]/g, '');
                if (newSudo) {
                    sudoNumbers.push(newSudo);
                    await sock.sendMessage(sender, { text: `✅ ${newSudo} added to Sudo list.` });
                }
            }

        } catch (e) {
            console.error("Execution Error:", e);
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) startSavage();
        } else if (connection === 'open') {
            console.log('🚀 SAVAGE-TECH IS ONLINE AND READY.');
        }
    });
}

startSavage();
