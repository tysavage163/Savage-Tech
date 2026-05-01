const wyr = [
  "Would you rather be invisible or be able to fly?",
  "Would you rather have no internet for a month or no phone for a year?",
  "Would you rather travel 1000 years into the past or 1000 years into the future?",
  "Would you rather be the funniest person in the room or the smartest?",
  "Would you rather live in a treehouse or a houseboat?",
  "Would you rather have dolphins as friends or wolves?",
  "Would you rather never eat pizza again or never eat chocolate again?",
  "Would you rather be able to talk to animals or speak every human language?",
  "Would you rather always be 10 minutes late or always have to leave 20 minutes early?",
  "Would you rather lose your sight or lose your hearing?",
  "Would you rather be a famous actor or a famous musician?",
  "Would you rather live in a world without music or a world without movies?",
  "Would you rather have unlimited money or unlimited time?",
  "Would you rather be able to redo one moment of your past or see one moment of your future?",
  "Would you rather be loved for someone you're not or hated for who you really are?",
  "Would you rather have a private jet or a private island?",
  "Would you rather never have to sleep again or never have to eat again?",
  "Would you rather know how you die or when you die?",
  "Would you rather be a giant dog or a tiny cat?",
  "Would you rather have the power to heal or the power to fly?",
  "Would you rather be a famous artist no one knows you secretly are, or a famous scientist everyone knows?",
  "Would you rather live in a beach house or a mountain cabin?",
  "Would you rather always have to sing instead of speak or dance instead of walk?",
  "Would you rather be able to teleport anywhere once a day or be able to stop time for 5 minutes?",
  "Would you rather be a master of every instrument or speak every language?",
  "Would you rather have a rewind button or a pause button for your life?",
  "Would you rather be friends with your childhood hero or date your current crush?",
  "Would you rather be a famous athlete or a famous actor?",
  "Would you rather have a photographic memory or be able to forget anything at will?",
  "Would you rather be the best player on a losing team or the worst player on a champion team?"
];
module.exports = {
  name: 'wouldyourather',
  category: 'fun',
  description: 'Would you rather question',
  async execute(sock, msg, args) {
    const random = wyr[Math.floor(Math.random() * wyr.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🤔 *Would you rather, @${senderName}?*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
