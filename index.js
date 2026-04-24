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
        // Using a high-compatibility mobile string
        browser: ["Chrome (Android)", "Chrome", "110.0.5481.153"]
    });

    if (!sock.authState.creds.registered) {
        console.log("\n⚡️ FINAL ATTEMPT MODE");
        const phoneNumber = await question("📞 Number: ");
        
        if (phoneNumber) {
            console.log(`⏳ Requesting code for ${phoneNumber}...`);
            // Minimal 3-second wait for network stabilization
            await new Promise(r => setTimeout(r, 3000)); 
            
            try {
                const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
                console.log(`\n✅ YOUR CODE IS: ${code}\n`);
            } catch (err) {
                console.log("❌ Handshake failed. Please toggle Airplane Mode and try once more.");
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
    });

    sock.ev.on('messages.delete', async (item) => {
        try {
            const key = item.keys[0];
            const cached = messagesCache.get(key.remoteJid)?.get(key.id);
            if (cached && cached.message) {
                const content = cached.message.conversation || cached.message.extendedTextMessage?.text || "Media Message";
                await sock.sendMessage(key.remoteJid, { text: `🗑️ *ANTIDELETE*\n\n💬 ${content}` });
            }
        } catch (e) { }
    });

    sock.ev.on("connection.update", (up) => {
        if (up.connection === "open") console.log("✅ BOT CONNECTED");
        if (up.connection === "close") startSavage();
    });
}

startSavage();
