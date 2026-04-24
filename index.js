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

// ===== 1. SETTINGS & HIERARCHY =====
global.prefix = "."; 
global.architect = "254798841125"; // YOU: The God Mode
global.commands = new Map();
global.antideleteMode = "chat"; // Default mode
const messageStore = new Map(); // Memory for Antidelete

// ===== 2. COMMAND LOADER =====
const loadCommands = () => {
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
};

// ===== 3. START SYSTEM =====
async function startSavage() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("\n📸 SESSION NOT FOUND. SCAN TO CONNECT:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n🚀 SAVAGE-TECH CONNECTED & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // ===== 4. MESSAGE HANDLER & HIERARCHY =====
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        
        // Anti-Delete: Save deep copy to memory
        messageStore.set(msg.key.id, JSON.parse(JSON.stringify(msg)));
        setTimeout(() => messageStore.delete(msg.key.id), 3600000);

        const isMe = msg.key.fromMe; 
        const isArchitect = sender.includes(global.architect); 
        const hasAccess = isArchitect || isMe; 

        const text = msg.message.conversation || 
                     msg.message.extendedTextMessage?.text || 
                     msg.message.imageMessage?.caption || "";

        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();

        const cmd = global.commands.get(commandName);
        if (cmd) {
            try {
                await cmd.execute(sock, msg, args, { isArchitect, isMe, hasAccess });
            } catch (e) {
                console.error(`Error in ${commandName}:`, e);
            }
        }
    });

    // ===== 5. ANTI-DELETE ENGINE (ON/OFF/CHAT/PRIVATE) =====
    sock.ev.on("messages.update", async (updates) => {
        for (const update of updates) {
            // Check for Protocol Message (Type 0 = Deletion)
            if (update.update.protocolMessage && update.update.protocolMessage.type === 0) {
                
                if (!global.antideleteMode || global.antideleteMode === "off") return;

                const key = update.update.protocolMessage.key;
                const prevMsg = messageStore.get(key.id);
                if (!prevMsg) return;

                const sender = prevMsg.key.participant || prevMsg.key.remoteJid;
                const content = prevMsg.message.conversation || 
                                prevMsg.message.extendedTextMessage?.text || 
                                "Media/Image/Document";

                const log = `
*🛡️ S Λ V Λ G Ξ  -  A N T I D E L E T E*

| INFO | DETAILS |
| :--- | :--- |
| 👤 *User* | @${sender.split("@")[0]} |
| 🕒 *Time* | ${new Date().toLocaleTimeString()} |
| 📁 *Mode* | ${global.antideleteMode.toUpperCase()} |

*💬 RESTORED CONTENT:*
> ${content}

_Master your tools or be mastered by them._`;

                // ROUTING
                let targetJid;
                if (global.antideleteMode === "private") {
                    targetJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                } else {
                    targetJid = key.remoteJid;
                }

                await sock.sendMessage(targetJid, { 
                    text: log, 
                    mentions: [sender] 
                }, { quoted: prevMsg });
            }
        }
    });
}

loadCommands();
startSavage();
