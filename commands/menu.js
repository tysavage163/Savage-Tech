// Build the list automatically from your commands folder
const adminCmds = [];
const downloadCmds = [];
const otherCmds = [];

global.commands.forEach((cmd, name) => {
    if (cmd.category === 'admin') adminCmds.push(name);
    else if (cmd.category === 'download') downloadCmds.push(name);
    else otherCmds.push(name);
});

let menuText = `
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  *☣ SAVAGE-TECH ☣*
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  👤 *ARCHITECT:* Spencer
┃  🛡️ *STATUS:* Active
┃  ⌛ *UPTIME:* ${Math.floor(process.uptime() / 60)}m
┃  ⌨️ *PREFIX:* [  ${global.prefix}  ]
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  *ADMIN (GC)*
${adminCmds.map(cmd => `┃  » ${global.prefix}${cmd}`).join('\n')}
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  *DOWNLOADS*
${downloadCmds.map(cmd => `┃  » ${global.prefix}${cmd}`).join('\n')}
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃  *OTHER TOOLS*
${otherCmds.map(cmd => `┃  » ${global.prefix}${cmd}`).join('\n')}
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
┃ _"Master your tools or be_
┃  _mastered by them."_
⛓‍━━━━━━━━━━━━━━━━━━━━━━⛓‍
`;

await sock.sendMessage(from, { 
    image: { url: 'https://i.ibb.co/680pZ7V/1777019342227.jpg' }, 
    caption: menuText 
}, { quoted: msg });
