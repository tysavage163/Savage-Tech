const valentine = [
  "Roses are red, violets are blue, every day with you feels brand new.",
  "You make my heart skip a beat. Happy Valentine's!",
  "Love is when you can't sleep because reality is better than dreams.",
  "You're the reason I believe in soulmates.",
  "Every love story is beautiful, but ours is my favorite.",
  "I fell in love with you, and I keep falling every day.",
  "You stole my heart, but I'll let you keep it.",
  "Being with you is my favorite place to be.",
  "You're my today and all of my tomorrows.",
  "I love you more than words can say.",
  "You're the best thing that ever happened to me.",
  "My heart beats for you and only you.",
  "You make my world brighter just by being in it.",
  "Loving you is the easiest thing I've ever done.",
  "You're my greatest adventure.",
  "I'd choose you in every lifetime.",
  "You're the missing piece I didn't know I was looking for.",
  "With you, every day is Valentine's.",
  "You're my sunshine on a cloudy day.",
  "I love you to the moon and back.",
  "You make me smile when I don't want to.",
  "You're not just my love – you're my home.",
  "I didn't fall in love with you, I walked into it with my eyes wide open.",
  "You're the reason I wake up with a smile.",
  "Every day I love you a little more.",
  "You're my happy place.",
  "I love you more than pizza – and that's saying a lot.",
  "You're the peanut butter to my jelly.",
  "If I know what love is, it is because of you.",
  "You're my forever Valentine."
];
module.exports = {
  name: 'valentines',
  category: 'fun',
  description: 'Valentine’s Day message',
  async execute(sock, msg, args) {
    const random = valentine[Math.floor(Math.random() * valentine.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `❤️ *Valentine’s wish for @${senderName}!*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
