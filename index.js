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
const qrcode = require("qrcode-terminal");

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
        } catch (err) {}
    }
}

async function startSavage() {
    console.log("🚀 Starting bot...");
    loadCommands();
    
    const { state, saveCreds } = await useMultiFileAuthState('session');
    
    const sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["SavageBot", "Chrome", "1.0.0"],
    });

    global.sock = sock;
    sock.ev.on('creds.update', saveCreds);

    // Generate QR code
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log("\n📱 SCAN THIS QR CODE WITH WHATSAPP:\n");
            qrcode.generate(qr, { small: true });
            console.log("\n1. Open WhatsApp → Settings → Linked Devices");
            console.log("2. Tap 'Link a Device'");
            console.log("3. Scan the QR code above\n");
        }
        
        if (connection === "open") {
            console.log("\n✅ BOT ONLINE!");
            console.log(`📌 Prefix: ${global.prefix}`);
            console.log(`📊 Commands: ${global.commands.size}\n`);
        }
        
        if (connection === "close") {
            if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                console.log("🔄 Restarting...");
                setTimeout(() => startSavage(), 5000);
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
            const cachedMsg = messagesCache.get(key.remoteJid)?.get(key.id);
            if (cachedMsg?.message) {
                let content = cachedMsg.message.conversation || 
                             cachedMsg.message.extendedTextMessage?.text || 
                             "Media";
                await sock.sendMessage(key.remoteJid, { 
                    text: `🗑️ *ANTI-DELETE*\n\n💬 ${content}` 
                });
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
