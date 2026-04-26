module.exports = {
    name: 'goodbye',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;

        const status = args[0]?.toLowerCase();

        if (status === 'on') {
            global.goodbyeStore.add(from);
            const goodbyeOn = `
╔════◇ 【 **GӨӨDBYΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Goodbye
┣┫ ⚡ **STATUS:** ACTIVATED
║
┣━━◇ 【 **IПFӨ** 】 ◇━━┫
║
┣┫ 👋 Bot will now notify when 
┣┫    someone leaves the group.
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: goodbyeOn }, { quoted: msg });

        } else if (status === 'off') {
            global.goodbyeStore.delete(from);
            const goodbyeOff = `
╔════◇ 【 **GӨӨDBYΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Goodbye
┣┫ ❌ **STATUS:** DEACTIVATED
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: goodbyeOff }, { quoted: msg });

        } else {
            const goodbyeHelp = `
╔════◇ 【 **GӨӨDBYΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 💡 **USAGE:**
┣┫ ↳ *.goodbye on*
┣┫ ↳ *.goodbye off*
║
╚════════════════════╝
   © *PӨЩΣЯΣD BY SΛVΛGΞ-TECH* ⛓️`;
            return sock.sendMessage(from, { text: goodbyeHelp }, { quoted: msg });
        }
    }
};
