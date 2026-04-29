/*
╔══════════════════════════════════════════════════════╗
║  .pair – Get WhatsApp Pairing Code (Native)          ║
║  Usage: .pair 254712345678                           ║
╚══════════════════════════════════════════════════════╝
*/

module.exports = {
    name: 'pair',
    category: 'tools',
    description: 'Generate a pairing code to link a new device',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const phoneNumber = args[0];

        // Input validation
        if (!phoneNumber) {
            return await sock.sendMessage(from, {
                text: '❌ *Usage:* `.pair 254712345678`\n_Include country code without "+" or spaces._'
            });
        }
        if (!/^\d{9,15}$/.test(phoneNumber)) {
            return await sock.sendMessage(from, {
                text: '❌ *Invalid number!*\nUse only digits with country code (e.g., 254712345678).'
            });
        }

        await sock.sendMessage(from, {
            text: `📡 *Requesting pairing code for* \`${phoneNumber}\`...\n*Please wait up to 15 seconds.*`
        });

        try {
            // Ensure the socket is ready
            if (!sock.user) {
                await new Promise(resolve => {
                    const check = setInterval(() => {
                        if (sock.user) {
                            clearInterval(check);
                            resolve();
                        }
                    }, 100);
                });
            }

            // ✅ IMPORTANT: Add a 5-second delay to let the connection stabilize
            console.log('Waiting 5 seconds before requesting pairing code...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Request the 8-digit pairing code from WhatsApp
            const code = await sock.requestPairingCode(phoneNumber);

            // Send the code back to the user
            await sock.sendMessage(from, {
                text: `🔐 *Your Pairing Code:*\n\`\`\`${code}\`\`\`\n\n📱 *How to use:*\n1️⃣ Open WhatsApp on your phone\n2️⃣ Go to *Settings* → *Linked Devices* → *Link a Device*\n3️⃣ Enter this code.\n\n⏳ *Expires in 5 minutes.*`
            });
        } catch (error) {
            console.error('Pairing error:', error);
            let errorMessage = '❌ *Failed to generate pairing code.*\n';
            if (error.message && error.message.includes('not ready')) {
                errorMessage += 'Bot is still connecting. Try again in 10 seconds.';
            } else if (error.message && error.message.includes('rate-overlimit')) {
                errorMessage += 'Too many attempts. Please wait a few minutes.';
            } else if (error.message && error.message.includes('timeout')) {
                errorMessage += 'Request timed out. Please try again.';
            } else {
                errorMessage += 'Check the number and try again (include country code, e.g., 254...).';
            }
            await sock.sendMessage(from, { text: errorMessage });
        }
    }
};
