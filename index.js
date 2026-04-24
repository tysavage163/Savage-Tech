const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

const messagesCache = new Map();
global.commands = new Map();
global.prefix = ".";

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans.trim());
    }));
};

function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            if (command.name) global.commands.set(command.name, command);
        } catch (err) { }
    }
}

async function startSavage() {
    loadCommands();
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        // Using a more stable browser string
        browser: ["Mac OS", "Chrome", "110.0.5481.178"]
    });

    if (!sock.authState.creds.registered) {
        console.log("\n⚠️ PAUSE: SETUP MODE ACTIVE");
        const phoneNumber = await question("📞 Enter your phone number (e.g., 2547XXXXXXXX): ");
        
        if (phoneNumber) {
            console.log(`⏳ Opening handshake with WhatsApp...`);
            // Slightly longer delay to allow the network to stabilize
            await new Promise(r => setTimeout(r, 7000)); 
            
            try {
                const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
            } catch (err) {
                console.log("❌ Connection timed out. Let's try one more time...");
                process.exit(1); 
            }
        }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const from = msg.key.remoteJid;
        if (!messagesCache.has(from)) messagesCache.set(from, new Map());
        messagesCache.get(from).set(msg.key.id, msg);

        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const cmd = global.commands.get(args.shift().toLowerCase());
            if (cmd) cmd.execute(sock, msg, args, from);
        }
    });

    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cached = messagesCache.get(key.remoteJid)?.get(key.id);
            if (cached) {
                const content = cached.message.conversation || cached.message.extendedTextMessage?.text || "Media Content";
                await sock.sendMessage(key.remoteJid, { text: `🗑️ *ANTIDELETE*\n\n💬 ${content}` });
            }
        } catch (e) { }
    });

    sock.ev.on("connection.update", (up) => {
        if (up.connection === "open") console.log("✅ SAVAGE-TECH ONLINE");
        if (up.connection === "close") {
            if (up.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                startSavage();
            }
        }
    });
}

startSavage();
