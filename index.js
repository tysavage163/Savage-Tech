const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const readline = require("readline");
const fs = require("fs");
const path = require("path");

// Configuration
global.prefix = "."; 
global.commands = new Map();

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans.trim());
    }));
};

// --- DYNAMIC COMMAND LOADER ---
// This lets you add new commands without touching index.js again
function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            if (command.name) {
                global.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            }
        } catch (err) {
            console.log(`❌ Failed to load ${file}: ${err.message}`);
        }
    }
}

async function startSavage() {
    loadCommands();
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
        browser: ["Savage-Tech", "Chrome", "1.0.0"]
    });

    // --- MOBILE PAIRING LOGIC ---
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question("📞 Enter Number (e.g., 2547XXXXXXXX): ");
        if (phoneNumber) {
            console.log("⏳ Requesting pairing code...");
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                    console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
                } catch (err) {
                    console.log("❌ Handshake failed. Toggle Airplane Mode and run 'node .' again.");
                }
            }, 3000);
        }
    }

    sock.ev.on('creds.update', saveCreds);

    // --- PREFIX COMMAND HANDLER ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const cmdName = args.shift().toLowerCase();
            const command = global.commands.get(cmdName);

            if (command) {
                try {
                    await command.execute(sock, msg, args);
                } catch (err) {
                    console.log(`Error in command ${cmdName}:`, err);
                }
            }
        }
    });

    sock.ev.on("connection.update", (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === "open") console.log("✅ BOT CONNECTED & READY");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });
}

startSavage();
