cat > index.js << 'EOF'
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (text) => new Promise((resolve) => {
    rl.question(text, resolve);
});

// Store for anti-delete
const messagesCache = new Map();
global.commands = new Map();
global.prefix = ".";

// ============ COMMANDS ============
global.commands.set("ping", {
    name: "ping",
    async execute(sock, msg, args, from) {
        await sock.sendMessage(from, { text: "🏓 Pong!" });
    }
});

global.commands.set("setprefix", {
    name: "setprefix",
    async execute(sock, msg, args, from) {
        if (!args[0]) return sock.sendMessage(from, { text: `Current prefix: ${global.prefix}` });
        global.prefix = args[0];
        await sock.sendMessage(from, { text: `✅ Prefix changed to: ${global.prefix}` });
    }
});

const warns = new Map();
global.commands.set("warn", {
    name: "warn",
    async execute(sock, msg, args, from) {
        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentioned) return sock.sendMessage(from, { text: `❌ Tag a user!` });
        const reason = args.slice(1).join(' ') || "No reason";
        if (!warns.has(mentioned)) warns.set(mentioned, []);
        warns.get(mentioned).push({ reason, date: Date.now() });
        await sock.sendMessage(from, { text: `⚠️ Warned!\nReason: ${reason}\nTotal: ${warns.get(mentioned).length}`, mentions: [mentioned] });
    }
});

global.commands.set("menu", {
    name: "menu",
    async execute(sock, msg, args, from) {
        await sock.sendMessage(from, { text: `⚡ SAVAGE BOT\nPrefix: ${global.prefix}\nCommands: ping, menu, setprefix, warn, warns, antidelete` });
    }
});

let antiDelete = true;
global.commands.set("antidelete", {
    name: "antidelete",
    async execute(sock, msg, args, from) {
        antiDelete = !antiDelete;
        await sock.sendMessage(from, { text: `Anti-delete: ${antiDelete ? "ON" : "OFF"}` });
    }
});
// ============ END COMMANDS ============

async function startSavage() {
    console.log("🚀 Starting bot...");
    
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["SavageBot", "Chrome", "1.0"],
    });

    global.sock = sock;

    // Handle connection
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === "open") {
            console.log("\n✅ BOT ONLINE!");
            console.log(`📌 Prefix: ${global.prefix}\n`);
        }
        
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("🔄 Restarting...");
                setTimeout(() => startSavage(), 5000);
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Request pairing code AFTER connection is ready
    if (!state.creds.registered) {
        // Wait a bit for socket to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const phoneNumber = await question("\n📞 Enter phone number (2547XXXXXXXX): ");
        console.log("⏳ Requesting pairing code...");
        
        try {
            const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
            console.log(`\n🔥 YOUR CODE: ${code}\n`);
            console.log("Open WhatsApp → Settings → Linked Devices → Link a Device");
            console.log("Enter this code (not the phone number)\n");
        } catch (err) {
            console.log("❌ Error:", err.message);
            console.log("Try QR code method instead (set printQRInTerminal: true)");
            process.exit(1);
        }
    }

    // Store messages
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (msg.key && msg.key.id && msg.key.remoteJid && !msg.key.fromMe) {
            if (!messagesCache.has(msg.key.remoteJid)) {
                messagesCache.set(msg.key.remoteJid, new Map());
            }
            messagesCache.get(msg.key.remoteJid).set(msg.key.id, msg);
        }
    });

    // Anti-delete
    sock.ev.on('messages.delete', async (item) => {
        if (!antiDelete) return;
        try {
            const key = item.keys[0];
            const cachedMsg = messagesCache.get(key.remoteJid)?.get(key.id);
            if (cachedMsg?.message) {
                let content = cachedMsg.message.conversation || 
                             cachedMsg.message.extendedTextMessage?.text || 
                             "Media";
                await sock.sendMessage(key.remoteJid, { text: `🗑️ Deleted: ${content}` });
            }
        } catch (e) {}
    });

    // Command handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        
        if (body.startsWith(global.prefix)) {
            const args = body.slice(global.prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();
            const command = global.commands.get(commandName);
            
            if (command) {
                try {
                    await command.execute(sock, msg, args, from);
                } catch (err) {
                    await sock.sendMessage(from, { text: "❌ Error!" });
                }
            }
        }
    });
}

startSavage();
EOF
