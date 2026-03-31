const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const fs = require('fs');

async function connectSavage() {
    console.log("🔥 SAVAGE-TECH: INITIALIZING...");
    const { state, saveCreds } = await useMultiFileAuthState('auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // This is the built-in QR generator
        logger: require('pino')({ level: 'silent' }),
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('📸 [QR DETECTED] SCAN NOW:');
        }

        if (connection === 'close') {
            console.log('❌ Connection Closed. Retrying in 5 seconds...');
            setTimeout(connectSavage, 5000);
        } else if (connection === 'open') {
            console.log('✅ SAVAGE-TECH IS ONLINE.');
            
            // LOAD COMMANDS ONLY AFTER CONNECTION IS SUCCESSFUL
            const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
            console.log(`🚀 ${commandFiles.length} Commands Armed and Ready!`);
        }
    });

    // BASIC MESSAGE LISTENER
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message) return;
        const msg = m.message.conversation || m.message.extendedTextMessage?.text || "";
        
        if (msg === '!ping') {
            await sock.sendMessage(m.key.remoteJid, { text: 'Savage-Tech is Active! ⚡' });
        }
    });
}

connectSavage();
