import {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} from "@whiskeysockets/baileys";

import Baileys from "@whiskeysockets/baileys";
const makeInMemoryStore = Baileys.makeInMemoryStore || Baileys.default?.makeInMemoryStore;
import pino from "pino";
import fs from "fs";
import qrcode from "qrcode-terminal";
import { pathToFileURL } from 'url';

global.prefix = "."; 
global.architect = "254798841125"; 
global.commands = new Map();
const store = makeInMemoryStore ? makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }) : null;

const loadCommands = async () => {
    if (!fs.existsSync("./commands")) fs.mkdirSync("./commands");
    const files = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));
    for (const file of files) {
        try {
            const fileURL = pathToFileURL(`./commands/${file}`).href;
            const cmd = await import(fileURL);
            if (cmd.name) global.commands.set(cmd.name, cmd);
        } catch (e) {
            console.log(`❌ Error loading ${file}: ${e.message}`);
        }
    }
    console.log(`✅ ${global.commands.size} Commands loaded successfully.`);
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
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Savage-Tech", "Safari", "1.0.0"]
    });

    if (store) store.bind(sock.ev);

    sock.ev.on("connection.update", (update) => {
        const { connection, qr, lastDisconnect } = update;
        if (qr) {
            console.log("\n📸 SCAN TO CONNECT:\n");
            qrcode.generate(qr, { small: true });
        }
        if (connection === "open") console.log("\n🚀 SAVAGE-TECH CONNECTED & READY!");
        if (connection === "close") {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startSavage();
        }
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages?.[0];
        if (!msg || !msg.message) return;

        const sender = msg.key.participant || msg.key.remoteJid;
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
}

loadCommands().then(() => startSavage());
