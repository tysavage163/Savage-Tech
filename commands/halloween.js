const halloween = [
  "Wishing you a spooky and fun Halloween!",
  "Trick or treat! May your night be filled with candy and laughter.",
  "Have a bootiful Halloween!",
  "May the ghosts be friendly and the candy be plentiful. Happy Halloween!",
  "Don't forget to save some candy for me. Happy Halloween!",
  "I'm here for the candy and the chaos. Happy Halloween!",
  "Hope your Halloween is scary good!",
  "May your jack-o'-lantern glow brightly tonight.",
  "Wishing you a night full of magic and mischief.",
  "Happy Halloween! Stay spooky, my friend.",
  "Eat lots of candy, watch scary movies, and enjoy the night.",
  "May your only scream tonight be from excitement. Happy Halloween!",
  "Boo! Did I scare you? Happy Halloween!",
  "Hope your Halloween is filled with treats, no tricks.",
  "Creep it real this Halloween!",
  "Happy Halloween! May your costume be awesome and your candy bowl full.",
  "Let's get this party started – it's Halloween!",
  "Wishing you a hauntingly beautiful night.",
  "I hope your Halloween is a real scream!",
  "May the spirits lift your mood and the candy lift your blood sugar.",
  "Happy Halloween! Don't forget to check your candy for razor blades (just kidding).",
  "Time to unleash your inner monster. Happy Halloween!",
  "Wishing you chills, thrills, and lots of spills (of candy).",
  "Have a wicked Halloween!",
  "Beware of ghosts, goblins, and sugar crashes. Happy Halloween!",
  "Tonight we feast on candy and fear. Happy Halloween!",
  "May your pumpkins be carved and your costumes be creative.",
  "Happy Halloween! Let the spooky season continue.",
  "Don't be afraid to be a little strange tonight. It's Halloween!",
  "Wishing you a horror-ific Halloween!"
];
module.exports = {
  name: 'halloween',
  category: 'fun',
  description: 'Halloween wishes',
  async execute(sock, msg, args) {
    const random = halloween[Math.floor(Math.random() * halloween.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🎃 *Halloween wish for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
