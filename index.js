cat > index.js << 'EOF'
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
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
            console.log(`❌ Failed: ${file}`);
        }
    }
}

async function startSavage() {
    console.log("🚀 Starting Savage Bot...");
    loadCommands();
    
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: true,  // USING QR CODE - MORE RELIABLE
        logger: pino({ level: "silent" }),
        browser: ["SavageBot", "Chrome", "1.0.0"],
        syncFullHistory: false,
        markOnlineOnConnect: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000
    });

    global.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    // Show QR code info
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("\n╔════════════════════════════════════╗");
            console.log("║  📱 SCAN THIS QR CODE WITH WHATSAPP  ║");
            console.log("╚════════════════════════════════════╝\n");
            console.log("1. Open WhatsApp on your phone");
            console.log("2. Tap Settings (3 dots or gear icon)");
            console.log("3. Tap Linked Devices");
            console.log("4. Tap 'Link a Device'");
            console.log("5. Scan this QR code\n");
        }
        
        if (connection === "open") {
            console.log("\n✅ BOT IS ONLINE!");
            console.log(`📌 Current prefix: ${global.prefix}`);
            console.log(`🛡️ Anti-delete: ACTIVE`);
            console.log(`📊 Commands loaded: ${global.commands.size}\n`);
        }
        
        if (connection === "close") {
            const code = lastDisconnect?.error?.output?.statusCode;
            console.log("❌ Connection closed!");
            if (code !== DisconnectReason.loggedOut) {
                console.log("🔄 Restarting in 5 seconds...");
                setTimeout(() => startSavage(), 5000);
            } else {
                console.log("⚠️ Session logged out. Run: rm -rf session && node .");
            }
        }
    });

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
        try {
            const key = item.keys[0];
            const chatCache = messagesCache.get(key.remoteJid);
            const cachedMsg = chatCache?.get(key.id);
            
            if (cachedMsg?.message) {
                let content = "📎 Media Message";
                const msg = cachedMsg.message;
                content = msg.conversation || 
                         msg.extendedTextMessage?.text ||
                         msg.imageMessage?.caption ||
                         msg.videoMessage?.caption ||
                         "📎 Media Message";
                
                await sock.sendMessage(key.remoteJid, { 
                    text: `🗑️ *ANTI-DELETE*\n\n💬 ${content.substring(0, 500)}` 
                });
                chatCache.delete(key.id);
            }
        } catch (e) {}
    });

    // Command handler
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
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
}

startSavage().catch(err => {
    console.error("Fatal error:", err);
    setTimeout(() => startSavage(), 5000);
});
EOF
