module.exports = {
    name: 'goodbye',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;

        // 1. Group Check
        if (!from.endsWith('@g.us')) {
            return sock.sendMessage(from, { text: '❌ This command is for Groups only.' }, { quoted: msg });
        }

        const status = args[0]?.toLowerCase();

        if (status === 'on') {
            global.goodbyeStore.add(from);
            const goodbyeOn = `
╔════◇ 【 **GӨӨDBYΣ ΣΣƬЦP** 】 ◇════╗
║
┣┫ 🛠️ **SYSTEM:** Goodbye
┣┫ ⚡ **STATUS:** ACTIVATED
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
