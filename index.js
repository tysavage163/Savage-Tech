cat > index.js << 'EOF'
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

function loadCommands() {
    const commandsFolder = path.join(__dirname, "commands");
    if (!fs.existsSync(commandsFolder)) fs.mkdirSync(commandsFolder);
    const commandFiles = fs.readdirSync(commandsFolder).filter(file => file.endsWith('.js'));
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

const question = (text) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(text, (ans) => {
        rl.close();
        resolve(ans);
    }));
};

async function startSavage() {
    console.log("🚀 Starting bot...");
    loadCommands();
    
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"],
        defaultQueryTimeoutMs: undefined,
        keepAliveIntervalMs: 30000
    });

    global.sock = sock;

    // Wait for connection to be ready
    let isConnected = false;
    
    sock.ev.on("connection.update", async (up) => {
        if (up.connection === "open") {
            console.log("✅ Connection established!");
            isConnected = true;
        }
        
        if (up.connection === "close") {
            console.log("❌ Connection closed");
            isConnected = false;
            if (up.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("🔄 Restarting in 5 seconds...");
                setTimeout(() => startSavage(), 5000);
            }
        }
    });

    // Wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Handle pairing
    if (!sock.authState.creds.registered) {
        const phoneNumber = await question("\n📞 Enter phone number (e.g., 254765956776): ");
        console.log("⏳ Requesting pairing code...");
        
        try {
            // Ensure socket is ready
            await new Promise(resolve => setTimeout(resolve, 2000));
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\n🔥 YOUR PAIRING CODE: ${code}\n`);
            console.log("📱 How to use:");
            console.log("1. Open WhatsApp on your phone");
            console.log("2. Go to Settings → Linked Devices");
            console.log("3. Tap 'Link a Device'");
            console.log("4. Enter this code\n");
        } catch (err) {
            console.log("❌ Pairing error:", err.message);
            console.log("🔄 Retrying in 10 seconds...");
            setTimeout(() => startSavage(), 10000);
            return;
        }
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key && msg.key.id && msg.key.remoteJid) {
            if (!messagesCache.has(msg.key.remoteJid)) {
                messagesCache.set(msg.key.remoteJid, new Map());
            }
            messagesCache.get(msg.key.remoteJid).set(msg.key.id, msg);
        }
        
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || 
                    msg.message.extendedTextMessage?.text || 
                    "";
        
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = global.commands.get(commandName);
            
            if (command) {
                try {
                    await command.execute(sock, msg, args, from);
                } catch (err) {
                    console.error(`Error in ${commandName}:`, err);
                    await sock.sendMessage(from, { text: "❌ Command error!" });
                }
            }
        }
    });

    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const chatCache = messagesCache.get(key.remoteJid);
            const cachedMsg = chatCache?.get(key.id);
            
            if (cachedMsg?.message) {
                let content = "Media Message";
                const msg = cachedMsg.message;
                content = msg.conversation || 
                         msg.extendedTextMessage?.text ||
                         msg.imageMessage?.caption ||
                         msg.videoMessage?.caption ||
                         "Media Message";
                
                await sock.sendMessage(key.remoteJid, { 
                    text: `🗑️ *ANTI-DELETE*\n\n💬 ${content.substring(0, 500)}` 
                });
            }
        } catch (e) {}
    });

    // Keep connection alive
    setInterval(() => {
        if (sock?.user) {
            sock.sendPresenceUpdate('available');
        }
    }, 30000);
}

startSavage().catch(err => {
    console.error("Fatal error:", err);
    setTimeout(() => startSavage(), 5000);
});
EOF
