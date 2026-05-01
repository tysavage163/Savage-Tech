const puns = [
  "I used to be a baker, but I couldn't make enough dough.",
  "I'm reading a book about anti-gravity. It's impossible to put down.",
  "Never trust stairs – they're always up to something.",
  "What do you call a fish wearing a bowtie? So-fish-ticated.",
  "I'd tell you a chemistry joke, but I know I wouldn't get a reaction.",
  "The past, present, and future walked into a bar. It was tense.",
  "I'm friends with all alphabets – I don't know why people hate on the letter 'Q'.",
  "Why did the scarecrow win an award? He was outstanding in his field.",
  "I don't trust stairs because they're always up to something.",
  "What do you call a fake noodle? An impasta.",
  "I'm on a seafood diet – I see food and I eat it.",
  "What do you call a can opener that doesn't work? A can't opener.",
  "I was addicted to the hokey pokey, but I turned myself around.",
  "What do you call a cow with no legs? Ground beef.",
  "I used to play piano by ear, but now I use my hands.",
  "What do you call a pig that does karate? A pork chop.",
  "I'm reading a book about mazes – I got lost in it.",
  "What do you call a bear with no teeth? A gummy bear.",
  "I wanted to be a surgeon, but I didn't have the patients.",
  "What do you call a dinosaur with an extensive vocabulary? A thesaurus.",
  "I'm no good at math, but I know that love is a fraction.",
  "What do you call a sleepwalking nun? A roamin' Catholic.",
  "I'm trying to organize a hide and seek tournament, but it's hard to find good players.",
  "What do you call a factory that sells okay products? A satis-factory.",
  "I'm on a whiskey diet – I've lost three days already.",
  "What do you call a fish with no eyes? A fsh.",
  "I used to be a shoe salesman, but I couldn't get a foot in the door.",
  "What do you call a snowman with a six-pack? An abdominal snowman.",
  "I told my wife she was drawing her eyebrows too high. She looked surprised.",
  "What do you call a belt made of watches? A waist of time."
];
module.exports = {
  name: 'puns',
  category: 'fun',
  description: 'Random pun',
  async execute(sock, msg, args) {
    const random = puns[Math.floor(Math.random() * puns.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🥁 *Pun for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
