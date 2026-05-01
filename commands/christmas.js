const xmas = [
  "Merry Christmas! May your day be merry and bright.",
  "Wishing you peace, joy, and love this Christmas.",
  "May the magic of Christmas fill your heart with happiness.",
  "Have a holly jolly Christmas!",
  "Merry Christmas to you and your family!",
  "Hope your Christmas is as sweet as a candy cane.",
  "Santa said to tell you: you've been good this year!",
  "May your home be filled with laughter and your belly with cookies.",
  "Wishing you a Christmas that sparkles with joy.",
  "Merry Christmas! Don't eat too many cookies (or do, I won't tell).",
  "Happy holidays! May your days be filled with warmth and gifts.",
  "All I want for Christmas is for you to be happy.",
  "May the spirit of Christmas stay with you all year.",
  "Wishing you a cozy Christmas by the fire.",
  "Merry Christmas! May your heart be light and your stockings full.",
  "Hope your Christmas is nothing short of magical.",
  "Wishing you the gift of faith, the blessing of hope, and the peace of love this Christmas.",
  "Merry Christmas to the person who makes my world better.",
  "Let's eat, drink, and be merry. It's Christmas!",
  "May your turkey be juicy and your family drama-free. Merry Christmas!",
  "Happy Christmas! May your days be bright and your nights cozy.",
  "I'm dreaming of a white Christmas… but I'll settle for good company.",
  "May your Christmas be filled with many presents and few returns.",
  "Wishing you a silent night and a bright day.",
  "Merry Christmas! May the new year bring you everything you wish for.",
  "Hope Santa brings you everything you wanted.",
  "Christmas is the spirit of giving. So I'm giving you this message. Merry Christmas!",
  "Wishing you the best Christmas ever!",
  "May the joy of Christmas be with you today and always.",
  "Happy Christmas! Let's make memories that last forever."
];
module.exports = {
  name: 'christmas',
  category: 'fun',
  description: 'Christmas wishes',
  async execute(sock, msg, args) {
    const random = xmas[Math.floor(Math.random() * xmas.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🎄 *Merry Christmas, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
