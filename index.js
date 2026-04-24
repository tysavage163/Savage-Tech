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

// Global Storage
const messagesCache = new Map();
global.commands = new Map();
global.prefix = ".";

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
    
    global.commands.clear(); // Clear old commands on reload
    for (const file of commandFiles) {
        try {
            const command = require(`./commands/${file}`);
            if (command.name) {
                global.commands.set(command.name, command);
                console.log(`✅ Loaded: ${command.name}`);
            }
        } catch (err) {
            console.log(`❌ Failed to load ${file}:`, err.message);
        }
    }
}

async function startSavage() {
    console.log("🚀 Starting Savage-Tech...");
    loadCommands();
    
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

    global.sock = sock;

    // --- PAIRING LOGIC ---
    if (!sock.authState.creds.registered) {
        // Wait for socket to warm up
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const phoneNumber = await question("\n📞 Enter number (e.g. 254765956776): ");
        console.log("⏳ Requesting pairing code...");
        
        try {
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
        } catch (err) {
            console.log("❌ Pairing error. Restarting...");
            setTimeout(() => startSavage(), 2000);
            return;
        }
    }

    sock.ev.on('creds.update', saveCreds);

    // --- MESSAGE HANDLER & CACHE ---
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        // Cache message for Anti-Delete
        const from = msg.key.remoteJid;
        if (!messagesCache.has(from)) messagesCache.set(from, new Map());
        messagesCache.get(from).set(msg.key.id, msg);

        // Command handler logic
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = global.commands.get(commandName);
            
            if (command) {
                try {
                    await command.execute(sock, msg, args, from);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    });

    // --- ANTI-DELETE ENGINE ---
    sock.ev.on('messages.delete', async (item) => {
        try {
            // Safety check for keys
            const key = item.keys ? item.keys[0] : item; 
            const chatCache = messagesCache.get(key.remoteJid);
            const cachedMsg = chatCache?.get(key.id);
            
            if (cachedMsg) {
                const msg = cachedMsg.message;
                const content = msg.conversation || msg.extendedTextMessage?.text || "Media Message";
                
                await sock.sendMessage(key.remoteJid, { 
                    text: `🗑️ *ANTIDELETE*\n\n💬 ${content}` 
                });
            }
        } catch (e) { console.log("Anti-Delete Error:", e.message); }
    });

    // --- CONNECTION HANDLER ---
    sock.ev.on("connection.update", (up) => {
        const { connection, lastDisconnect } = up;
        if (connection === "open") {
            console.log("✅ BOT ONLINE!");
        }
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });
}

startSavage();
