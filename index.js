const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");

// ===== 1. CORE SYSTEM SETTINGS =====
global.prefix = "."; 
global.commands = new Map();
global.blacklist = new Set(); 
global.antideleteMode = "on"; 
global.autoViewStatus = "on"; 
global.autoTyping = "off"; // New: Ghost Mode toggle
global.worktype = "public"; 

// ===== 2. COMMAND LOADER =====
const loadCommands = () => {
    global.commands.clear();
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const fullPath = require.resolve(`./commands/${file}`);
            delete require.cache[fullPath]; 
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
};

// ===== 3. BOOT SEQUENCE =====
async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: true,
        logger: pino({ level: "silent" }),
        browser: ["SΛVΛGΞ-TECH", "Safari", "1.0.0"] 
    });

    // ===== GHOST ENGINE (CONSTANT TYPING) =====
    setInterval(async () => {
        if (global.autoTyping === "on") {
            // This sends the typing signal to your own chat to keep the server updated
            await sock.sendPresenceUpdate('composing', sock.user.id);
        }
    }, 4000);

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr && !fs.existsSync("./session/creds.json")) {
            console.log("\n📸 SCAN QR TO INITIALIZE NEURAL LINK:\n");
            qrcode.generate(qr, { small: true });
        }

        if (connection === "open") {
            console.log("\n🚀 SΛVΛGΞ-TECH IS LIVE!");
            const myNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            await sock.sendMessage(myNumber, { text: "╔════════════════════╗\n      ⛓️ **SΛVΛGΞ-TECH V1** ⛓️\n╚════════════════════╝\n\n📡 **STATUS:** RECONNECTED\n👤 **ROLE:** ARCHITECT\n🛡️ **SYSTEM:** GHOST ENGINE LOADED" });
        }

        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = reason !== DisconnectReason.loggedOut;
            if (shouldReconnect) setTimeout(() => startSavage(), 5000);
            else {
                if (fs.existsSync("./session")) fs.rmSync("./session", { recursive: true, force: true });
                process.exit(0);
            }
        }
    });

    // ===== 4. MESSAGE HANDLER =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe; 

        // AUTO-VIEW STATUS LOGIC
        if (from === 'status@broadcast' && global.autoViewStatus === "on") {
            await sock.readMessages([msg.key]);
            return;
        }

        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        
        const cmd = global.commands.get(commandName);
        if (cmd) {
            if (global.worktype === 'private' && !isMe) return;
            try {
                // Trigger typing presence when a command is received
                await sock.sendPresenceUpdate('composing', from);
                await cmd.execute(sock, msg, args, { isArchitect: isMe, isMe });
            } catch (e) { 
                console.error(`❌ Command Error [${commandName}]:`, e);
            }
        }
    });

    // ===== 5. GROUP EVENT HANDLER =====
    sock.ev.on('group-participants.update', async (anu) => {
        const { id, participants, action } = anu;
        const welcomeCmd = global.commands.get('welcome');
        if (!welcomeCmd || !welcomeCmd.isToggled || !welcomeCmd.isToggled(id)) return;

        try {
            const metadata = await sock.groupMetadata(id);
            const eventHandler = require('./commands/events.js');
            for (let participant of participants) {
                if (action === 'add') await eventHandler.sendWelcome(sock, id, participant, metadata.subject);
                else if (action === 'remove') await eventHandler.sendGoodbye(sock, id, participant);
            }
        } catch (e) { console.error("❌ Event Error:", e); }
    });
}

loadCommands();
startSavage();
