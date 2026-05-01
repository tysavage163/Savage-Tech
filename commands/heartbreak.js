const heartbreak = [
  "It hurts to let go, but sometimes it hurts more to hold on.",
  "The saddest thing about betrayal is that it never comes from your enemies.",
  "You can't start the next chapter of your life if you keep re-reading the last one.",
  "Sometimes the person you'd take a bullet for ends up being the one behind the gun.",
  "Tears are words the heart can't express.",
  "Some people are going to leave, but that's not the end of your story.",
  "The hardest part of walking away is the moment you realize you don't matter to them anymore.",
  "Pain changes people, but it also builds character.",
  "You don't drown by falling in water. You drown by staying there.",
  "Sometimes good things fall apart so better things can fall together.",
  "The most painful goodbyes are the ones that are never said and never explained.",
  "Don't cry over someone who wouldn't cry over you.",
  "It's better to be alone than to be with someone who makes you feel lonely.",
  "The wound heals, but the scar remains.",
  "You can love someone so much, but you can never force them to love you back.",
  "The worst feeling isn't being lonely, it's being forgotten by someone you could never forget.",
  "Moving on is simple, but it's never easy.",
  "Sometimes you have to accept that some people are part of your history, but not your destiny.",
  "The pain of yesterday is the strength of tomorrow.",
  "Don't be sad that it's over, be glad that it happened.",
  "Letting go doesn't mean you stop caring. It means you stop trying to force something that isn't meant to be.",
  "You can't force someone to respect you, but you can walk away from those who don't.",
  "Some people are meant to break you. Others are meant to build you. Choose wisely.",
  "The biggest mistake we make is thinking that someone's apology means they won't hurt us again.",
  "Never allow someone to be your priority while allowing yourself to be their option.",
  "Sometimes the person you thought would never hurt you is the one who breaks you the most.",
  "Your value doesn't decrease based on someone's inability to see your worth.",
  "It's okay to be sad. It's okay to cry. But don't let it kill you.",
  "Time heals almost everything. Give time, time.",
  "One day you will look back and realize that the heartbreak was just a gift in disguise."
];
module.exports = {
  name: 'heartbreak',
  category: 'fun',
  description: 'Thoughts on heartbreak',
  async execute(sock, msg, args) {
    const random = heartbreak[Math.floor(Math.random() * heartbreak.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `💔 *Heartbreak thought for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
