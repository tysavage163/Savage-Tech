const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    makeCacheableSignalKeyStore,
    fetchLatestBaileysVersion,
    jidNormalizedUser
} = require("@whiskeysockets/baileys");

const Baileys = require("@whiskeysockets/baileys");
const makeInMemoryStore =
    Baileys.makeInMemoryStore ||
    require("@whiskeysockets/baileys/lib/Store").makeInMemoryStore;

const pino = require("pino");
const fs = require("fs");
const readline = require("readline");

// ===== GLOBAL SETTINGS =====
global.prefix = "!"; // used by setprefix command

const store = makeInMemoryStore({
    logger: pino().child({ level: "silent
