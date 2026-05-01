const friendship = [
  "A true friend is the greatest gift.",
  "Friends are the family we choose.",
  "Thank you for always being there for me.",
  "You make my life brighter just by being in it.",
  "Friendship isn't about who you've known the longest, it's about who walked in and never left.",
  "You're the peanut butter to my jelly.",
  "I don't know what I'd do without you.",
  "You make the good times better and the hard times easier.",
  "True friends are never apart, maybe in distance but never in heart.",
  "You're my favorite person to cause trouble with.",
  "A good friend knows all your stories. A best friend helped you write them.",
  "Thanks for being the reason I smile.",
  "Friendship is born at the moment when one person says to another, 'What, you too? I thought I was the only one.'",
  "You're my rock, my confidant, my partner in crime.",
  "I appreciate you more than words can say.",
  "You've seen me at my worst and still chose to stay. That's real friendship.",
  "Side by side or miles apart, real friends are always close to the heart.",
  "You're the sister/brother I never had.",
  "Let's be weird together forever.",
  "Thank you for accepting me as I am.",
  "You're the kind of friend everyone deserves.",
  "Our friendship is the stuff of legends.",
  "You're my human diary.",
  "I'm so grateful for your friendship.",
  "You always know how to cheer me up.",
  "You're my favorite notification.",
  "Life is better with you in it.",
  "You're not just my friend, you're my family.",
  "We'll be friends until we're old and gray – and then we'll be friends in heaven.",
  "You're the best thing that happened to me outside my family."
];
module.exports = {
  name: 'friendship',
  category: 'fun',
  description: 'Friendship message',
  async execute(sock, msg, args) {
    const random = friendship[Math.floor(Math.random() * friendship.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🤝 *Friendship message for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
