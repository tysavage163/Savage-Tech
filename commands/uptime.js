module.exports = {
    name: 'uptime',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // --- ⚙️ UPTIME CALCULATION ---
        const uptimeSeconds = process.uptime();
        const days = Math.floor(uptimeSeconds / (24 * 3600));
        const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = Math.floor(uptimeSeconds % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const uptimeText = `
┎──────────────────────────╼
┃   ⚡ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐇𝐄𝐀𝐑𝐓𝐁𝐄𝐀𝐓 ⚡
┖──────────────────────────╼

┏━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🛰️  𝐒𝐓𝐀𝐓𝐔𝐒: 𝐎𝐍𝐋𝐈𝐍𝐄
┃ ⏳ 𝐑𝐔𝐍𝐓𝐈𝐌𝐄: ${uptimeString}
┃ 🧬 𝐈𝐍𝐓𝐄𝐆𝐑𝐈𝐓𝐘: 𝐒𝐓𝐀𝐁𝐋𝐄
┃ 🌐 𝐍𝐄𝐓𝐖𝐎𝐑𝐊: 𝐂𝐎𝐍𝐍𝐄𝐂𝐓𝐄𝐃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌──────────────────────────┐
    "𝐄𝐧𝐝𝐮𝐫𝐚𝐧𝐜𝐞 𝐢𝐬 𝐭𝐡𝐞 
     𝐦𝐚𝐫𝐤 𝐨𝐟 𝐩𝐞𝐫𝐟𝐞𝐜𝐭𝐢𝐨𝐧."
        — 𝑩𝒆𝒄𝒌 𝑺𝒑𝒆𝒏𝒄𝒆𝒓
└──────────────────────────┘
`;

        await sock.sendMessage(from, { 
            text: uptimeText,
            contextInfo: {
                externalAdReply: {
                    title: "Savage-Tech Runtime Diagnostics",
                    body: `Continuous Operation: ${uptimeString}`,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    // Using the first Sci-Fi image for consistency
                    thumbnailUrl: "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/0c780413-5837-4d2c-bc94-5c91851e7a93.png",
                    sourceUrl: "https://github.com/tysavage163/Savage-Tech"
                }
            }
        }, { quoted: msg });
    }
};
