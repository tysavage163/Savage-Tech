const bfDay = [
  "Happy Boyfriend's Day to my favorite person.",
  "You make my world so much better. Thank you for being you.",
  "I'm so lucky to have you. Enjoy your day, babe!",
  "You're my rock, my joy, my everything.",
  "Happy Boyfriend's Day to the one who makes me laugh.",
  "Thanks for being my partner in crime and my best friend.",
  "I appreciate everything you do for us.",
  "You're handsome, kind, and amazing. Happy Boyfriend's Day!",
  "I love you more every single day.",
  "You're my favorite notification. Happy Boyfriend's Day!",
  "Thank you for always supporting me.",
  "You're the best thing that ever happened to me.",
  "Happy Boyfriend's Day to my safe haven.",
  "You make the good times better and the hard times easier.",
  "I'm grateful for your patience, your love, and your strength.",
  "You're my king. Let's celebrate you today!",
  "I love you to the moon and back. Happy Boyfriend's Day!",
  "Thank you for being my protector and my soft place to land.",
  "Happy Boyfriend's Day! You deserve all the happiness.",
  "You're my dream come true.",
  "I'm so proud to call you mine. Happy Boyfriend's Day!",
  "Thanks for the adventures, the cuddles, and the love.",
  "You're my sunshine after the rain.",
  "Happy Boyfriend's Day to my favorite human.",
  "I fall for you more and more each day.",
  "You're the reason I believe in love.",
  "Thank you for being you – unapologetically and wonderfully.",
  "Happy Boyfriend's Day! Let's make today special.",
  "You're my heart, my home, my everything.",
  "I love you always. Enjoy your day!"
];
module.exports = {
  name: 'boyfriendsday',
  category: 'fun',
  description: 'Boyfriend’s Day wishes',
  async execute(sock, msg, args) {
    const random = bfDay[Math.floor(Math.random() * bfDay.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💙 *Happy Boyfriend's Day, @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
