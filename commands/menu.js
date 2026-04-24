module.exports = {
    name: "menu",
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const prefix = global.prefix;
        const pushName = msg.pushName || "User";
        const userNumber = msg.key.participant || msg.key.remoteJid;

        // Your provided Image Link
        const menuImage = "https://i.supaimg.com/57b03ae1-422b-4801-b5d2-661ece6d38ae/0c780413-5837-4d2c-bc94-5c91851e7a93.png"; 

        const menuText = `
┏━━━━ ✨ *SAVAGE-TECH* ✨ ━━━━┓

👤 *USER INFO*
▢ *Name:* ${pushName}
▢ *ID:* @${userNumber.split('@')[0]}

┣━━━ 🛠️ *SYSTEM* ━━━┓
┃ ▢ ${prefix}ping
┃ ▢ ${prefix}uptime
┃ ▢ ${prefix}alive
┃ ▢ ${prefix}update
┃
┣━━━ 🛡️ *ADMIN* ━━━┓
┃ ▢ ${prefix}warn
┃ ▢ ${prefix}kick
┃ ▢ ${prefix}promote
┃ ▢ ${prefix}demote
┃ ▢ ${prefix}hidetag
┃
┣━━━ ⚙️ *SETTINGS* ━━━┓
┃ ▢ ${prefix}setprefix
┃ ▢ ${prefix}setgdesc
┃ ▢ ${prefix}mode
┃
┣━━━ 📥 *DOWNLOAD* ━━━┓
┃ ▢ ${prefix}play
┃ ▢ ${prefix}dl
┃ ▢ ${prefix}tt
┃ ▢ ${prefix}vv
┃
┣━━━ 🎨 *TOOLS* ━━━┓
┃ ▢ ${prefix}sticker
┃ ▢ ${prefix}owner
┃
┗━━━━━━━━━━━━━━━━━━━━┛

📢 *Status:* Antidelete Active 🛡️`.trim();

        try {
            await sock.sendMessage(from, { 
                image: { url: menuImage }, 
                caption: menuText,
                mentions: [userNumber]
            }, { quoted: msg });
        } catch (e) {
            console.error("Menu Image Error:", e);
            // Fallback to text-only if the image fails to load
            await sock.sendMessage(from, { text: menuText }, { quoted: msg });
        }
    }
};
