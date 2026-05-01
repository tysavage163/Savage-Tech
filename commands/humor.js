const humor = [
  "My ability to ruin everything is my only constant.",
  "I'm not lazy, I'm on energy saving mode.",
  "My brain has two modes: 'I can do everything' and 'what is my name again'.",
  "I need a six-month vacation twice a year.",
  "I'm not arguing, I'm just explaining why I'm right.",
  "I'm not a control freak, but can I show you the right way to do that?",
  "I'm not short, I'm concentrated awesome.",
  "My life is like a movie, just with no plot, no character development, and a terrible soundtrack.",
  "I'm not late, I'm on a different time zone called 'whenever I arrive'.",
  "My favorite exercise is a cross between a lunge and a crunch – it's called lunch.",
  "I'm not clumsy, the floor just needed a hug.",
  "My diet plan is to eat everything and hope for the best.",
  "I'm not ignoring you, I'm just thinking about food.",
  "My sleep schedule is more like a sleep suggestion.",
  "I'm not a morning person, I'm a 'don't talk to me until I've had coffee' person.",
  "I'm not weird, I'm limited edition.",
  "My excuse for everything: 'It seemed like a good idea at the time'.",
  "I'm not a player, I just crush a lot.",
  "My emotional baggage is carry-on size, but I still need help lifting it.",
  "I'm not old, I'm retro.",
  "My spirit animal is a sloth on a Monday morning.",
  "I'm not a gamer, I'm a professional button masher.",
  "My cooking is like a chemistry experiment – sometimes it explodes.",
  "I'm not a fan of vegetables, but I'll make an exception for pizza toppings.",
  "My memory is like a sieve – it only holds the things I don't want to remember.",
  "I'm not a hoarder, I just like to keep everything for 'someday'.",
  "My workout routine is: curl a fork into my mouth, lift a spoon to my lips.",
  "I'm not passive aggressive, but I'll write a strongly worded note and leave it on your desk.",
  "My life is a constant battle between my love for food and my hate for exercise.",
  "I'm not a night owl, I'm a 24-hour disappointment."
];
module.exports = {
  name: 'humor',
  category: 'fun',
  description: 'Relatable and funny thoughts',
  async execute(sock, msg, args) {
    const random = humor[Math.floor(Math.random() * humor.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `😅 *For you, @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
