const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    makeInMemoryStore
} = require("@whiskeysockets/baileys");

const pino = require("pino");
const fs = require("fs");
const qrcode = require("qrcode-terminal");
const path = require("path");

// Global Configuration
global.prefix = "."; 
global.architect = "254798841125"; 
global.commands = new Map();
global.antidelete = true; 

// Setup Store for Antidelete
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
store.readFromFile('./savage_store.json');
setInterval(() => { store.writeToFile('./savage_store.json') }, 10000);

const loadCommands = () => {
    const commandsPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath);
    const files = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
    for (const file of files) {
        try {
            const cmd = require(`./commands/${file}`);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) { console.log(`❌ Error in ${file}: ${e.message}`); }
    }
    console.log(`✅ ${global.commands.size} Commands loaded.`);
};

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
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    store.bind(sock.ev);
    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === "open") console.log("\n🚀 SAVAGE-TECH ONLINE!");
        if (connection === "close") startSavage();
    });

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg || !msg.message) return;
        const from = msg.key.remoteJid;

        // --- 🛡️ ANTIDELETE ---
        if (msg.message.protocolMessage && msg.message.protocolMessage.type === 0 && global.antidelete) {
            const key = msg.message.protocolMessage.key;
            const savedMsg = await store.loadMessage(key.remoteJid, key.id);
            if (savedMsg) {
                const sender = key.participant || key.remoteJid;
                await sock.sendMessage(from, { text: `☣ *SAVAGE-TECH ANTIDELETE*\n\n@${sender.split("@")[0]} tried to delete a message:`, mentions: [sender] });
                await sock.copyNForward(from, savedMsg, true);
            }
        }

        // --- ⌨️ COMMANDS ---
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        if (!text.startsWith(global.prefix)) return;

        const args = text.slice(global.prefix.length).trim().split(/\s+/);
        const commandName = args.shift().toLowerCase();
        const cmd = global.commands.get(commandName);

        if (cmd) {
            const isArchitect = (msg.key.participant || from).includes(global.architect);
            try {
                await cmd.execute(sock, msg, args, { isArchitect, store });
            } catch (e) { console.error(e); }
        }
    });
}

loadCommands();
startSavage();
