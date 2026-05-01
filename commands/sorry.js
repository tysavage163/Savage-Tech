const sorry = [
  "I'm sorry. I made a mistake and I regret it deeply.",
  "Please forgive me. I'll do whatever it takes to make it right.",
  "I was wrong, and I'm truly sorry for hurting you.",
  "Sorry isn't just a word, it's a promise to do better.",
  "I messed up. I hope you can find it in your heart to forgive me.",
  "I'm sorry for the pain I caused. It was never my intention.",
  "I value our relationship more than my pride. Please forgive me.",
  "I'm sorry. I'll work hard to earn back your trust.",
  "My actions were thoughtless, and I regret them deeply. Please accept my apology.",
  "I'm sorry for letting you down. I'll do better next time.",
  "I understand if you're upset. I'm sorry for my selfish behavior.",
  "I'm sorry for the words I said in anger. I didn't mean them.",
  "Please give me another chance to prove myself. I'm sorry.",
  "I know sorry isn't enough, but I hope you see that I'm genuinely remorseful.",
  "I'm sorry for not listening when you needed me to.",
  "I'm sorry for being so difficult. I'll try to be more understanding.",
  "I'm sorry for not being the person you deserve. I'll try to improve.",
  "I'm sorry for hurting you. You didn't deserve any of it.",
  "Please forgive me. I'm not perfect, but I'm willing to learn.",
  "I'm sorry for making you feel unloved. You mean everything to me.",
  "I'm sorry for not being honest with you. You deserve the truth.",
  "I'm sorry for taking you for granted. I realize now how much you mean to me.",
  "I'm sorry for the times I wasn't there when you needed me.",
  "I'm sorry for being jealous and insecure. I trust you and I'm sorry I didn't show it.",
  "I'm sorry for all the fights. I just want peace between us.",
  "I'm sorry for letting my pride get in the way of us.",
  "I'm sorry for not being strong enough for both of us.",
  "I'm sorry for crossing your boundaries. I'll respect them from now on.",
  "I'm sorry for breaking your heart. If I could take it back, I would.",
  "I'm sorry for everything. Please let me make it up to you."
];
module.exports = {
  name: 'sorry',
  category: 'fun',
  description: 'Apology message',
  async execute(sock, msg, args) {
    const random = sorry[Math.floor(Math.random() * sorry.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `🙏 *Apology for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
