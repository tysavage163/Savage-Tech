const roseDay = [
  "Happy Rose Day! A single rose can say more than a thousand words.",
  "Sending you a rose to brighten your day. Happy Rose Day!",
  "Roses are red, violets are blue, this rose is for someone as sweet as you.",
  "May your day be filled with the fragrance of love. Happy Rose Day!",
  "Every rose has its thorn, but you only have beauty. Happy Rose Day!",
  "Here's a virtual rose for you. May your life bloom like a rose garden.",
  "Wishing you a Rose Day as beautiful as you are.",
  "A rose speaks of love silently. Happy Rose Day!",
  "Sending you a bouquet of happiness. Happy Rose Day!",
  "May this Rose Day mark the beginning of something wonderful.",
  "Roses are the poetry of the earth. Enjoy your day!",
  "Happy Rose Day! May your heart be as open as a rose in bloom.",
  "Let today be a reminder of how special you are. Happy Rose Day!",
  "I'd send you a real rose if I could, but this message will have to do.",
  "Roses bring joy, and so do you. Happy Rose Day!",
  "May your day be as brilliant as a red rose.",
  "A rose for your thoughts, a hug for your heart. Happy Rose Day!",
  "Wishing you a day full of love and roses.",
  "Roses are nature's smile. Keep smiling!",
  "Happy Rose Day! Don't forget to smell the roses (or at least look at their pictures).",
  "May your life be as colorful as a rainbow of roses.",
  "Sending you love wrapped in rose petals. Happy Rose Day!",
  "Roses are a reminder that even thorns can produce beauty. Happy Rose Day!",
  "Wishing you a Rose Day filled with romance and happiness.",
  "Let the fragrance of roses fill your soul. Happy Rose Day!",
  "A rose for you, my friend, because you make life sweeter.",
  "Roses are red, violets are blue, this message is short, but it's only for you.",
  "Happy Rose Day! May your heart feel loved today.",
  "Roses may wilt, but my wishes for you will stay fresh forever.",
  "Enjoy this day dedicated to love and roses. Happy Rose Day!"
];
module.exports = {
  name: 'roseday',
  category: 'fun',
  description: 'Rose Day wishes',
  async execute(sock, msg, args) {
    const random = roseDay[Math.floor(Math.random() * roseDay.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🌹 *Rose Day wish for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
