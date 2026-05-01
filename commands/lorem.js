const lorem = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.",
  "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
  "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur."
];
module.exports = {
  name: 'lorem',
  category: 'tools',
  description: 'Generate Lorem Ipsum text',
  async execute(sock, msg, args) {
    let count = parseInt(args[0]) || 1;
    if (count < 1) count = 1;
    if (count > 10) count = 10;
    const text = Array(count).fill().map(() => lorem[Math.floor(Math.random() * lorem.length)]).join(' ');
    const sender = msg.pushName || 'User';
    const jid = msg.key.participant || msg.key.remoteJid;
    await sock.sendMessage(msg.key.remoteJid, { text: `📝 *Lorem Ipsum for @${sender}*\n\n${text}\n\n🚀 POWERED BY SAVAGE-CORE`, mentions: [jid] });
  }
};
