const roasts = [
  "You're not stupid; you just have bad luck thinking.",
  "I'd agree with you, but then we'd both be wrong.",
  "You bring everyone so much joy – when you leave.",
  "I've seen salads more intimidating than you.",
  "You're like a cloud – when you disappear, it's a beautiful day.",
  "If I wanted to hear from an idiot, I'd watch your voicemail.",
  "You're the reason they put instructions on shampoo bottles.",
  "I'd call you a tool, but that would be an insult to tools.",
  "You're proof that evolution can go in reverse.",
  "Somewhere a tree is producing oxygen for you. You should go apologize.",
  "You have the right to remain silent. Please use it.",
  "I'm not saying you're stupid, but you've got a face that screams 'I put the 'D' in 'Dumb'.",
  "You're not a complete waste of space. You're at least good for a warning to others.",
  "If your brain was dynamite, there wouldn't be enough to blow your nose.",
  "You're like a software update – I keep ignoring you.",
  "You have something on your chin… oh wait, that's your face.",
  "I'd tell you to go outside and get some fresh air, but you'd probably complain about the oxygen.",
  "You're not ugly, but you're definitely not pretty. You're just... there.",
  "You're the human equivalent of a wet sock.",
  "You're like a broken pencil – pointless.",
  "I've met rocks with more personality than you.",
  "You're so forgettable, even your shadow leaves you.",
  "You're the type of person who would trip over a wireless mouse.",
  "If you were any more basic, you'd be baking soda.",
  "You're not a clown, but the whole circus is missing you.",
  "You're the reason God created duct tape – to seal your mouth shut.",
  "You're like a candle in the wind – useless indoors.",
  "You're not hot; you're room temperature at best.",
  "I'd roast you, but my mom said not to burn trash.",
  "You're the reason shampoo has instructions."
];
module.exports = {
  name: 'roasts',
  category: 'fun',
  description: 'Playful roast',
  async execute(sock, msg, args) {
    const random = roasts[Math.floor(Math.random() * roasts.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🔥 *Roast for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
