const shayari = [
  "बातें तो बहुत हैं, लेकिन शब्द कम पड़ते हैं, जब बात दिल से दिल की होती है।",
  "Muskaan tumhari wajah se hai, warna dard to humein bhi tha.",
  "Log milte nahi, mil jate hain. Rishte nahi bante, ban jate hain.",
  "Tujhe dekh kar yeh ehsaas hua, ki khuda bhi kisi ko yaad karta hai.",
  "Kuch log aise hote hain jo na chahte hue bhi dil mein utar jate hain.",
  "Zindagi hai to kuch to baat hogi, warna yaar har kisi ko kya milta hai.",
  "Woh mila to aisa laga, jaisi har subah ho.",
  "Dil ki baat zubaan tak aate aate reh jaati hai, aur hum aankhon se kehne lagte hain.",
  "Mohabbat mein itna mat udaas ho, ki khud ki khushi bhool jao.",
  "Ankhein bhot kuch kehti hain, lekin hum jaane kyun anjaan ban jaate hain.",
  "Jo mila hai, uska shukar kar, warna duniya mein sab koi nahi milta.",
  "Kami hum mein bhi thi, kami unme bhi thi, par humne rishta tha toh sab acha lagta tha.",
  "Woh aaye to yaad aaya, zindagi sirf unki nahi, apni bhi hai.",
  "Agar humare pyaar ki kadar nahi, toh kisi aur ki bhimat kahan.",
  "Dard chupane ka hunar rakhte hain, log samajhte hain humein gam nahi.",
  "Khuda se yeh dua hai, ki har subah sukh de, har shaayar ko koi shayari mil jaaye.",
  "Tera chehra bahar hai, teri yaadein raat hai. Na tum ho, na tum hoge, yeh kaisi baat hai.",
  "Woh humse door hai, lekin hum unke paas hain. Kyunki pyaar mein dooriyan kya hoti hain.",
  "Kuch rishte zameen se nahi, aasman se bante hain. Aur to aur, khud khuda bhi unme shaamil hota hai.",
  "Humne toh har ghadi unhe yaad kiya, unhe fursat hi nahi mili.",
  "Be-wajah ki khushi, be-wajah ka gussa – sab unke hone ka ehsaas hai.",
  "Uski ik jhalak ke liye, hum duniya bhool gaye. Lekin woh humein bhool gaye.",
  "Mohabbat mein aisa haal hota hai, ki apne saaye se bhi pyaar ho jaata hai.",
  "Tum paas ho ya nahi, ehsaas tumhara saath hai.",
  "Khamoshiyan kya cheez hai, humein toh har lafz mein tum sunai dete ho.",
  "Gum toh pehle bhi the, ab aur hain. Farak sirf itna hai, ab tumne thode aur badha diye.",
  "Tumhari kami toh humesha rahegi, lekin tumse milna toh ek baar aur chahiye.",
  "Zindagi mein kuch log aise aate hain, jaise khushbu – mehfil mein toh nahi hote, par ehsaas chhod jaate hain.",
  "Jis taraf dekho, woh hi nazar aate hain. Shayad hum unhe dhund rahe hain, ya woh humein bula rahe hain.",
  "Dard ki shayari kya likhun, tere bin toh har lafz adhura hai."
];
module.exports = {
  name: 'shayari',
  category: 'fun',
  description: 'Hindi/Urdu romantic poetry',
  async execute(sock, msg, args) {
    const random = shayari[Math.floor(Math.random() * shayari.length)];
    const senderName = msg.pushName || 'User';
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const mention = [senderJid];
    await sock.sendMessage(msg.key.remoteJid, { 
      text: `📜 *Shayari for @${senderName}*\n\n${random}\n\n🚀 POWERED BY SAVAGE-CORE`, 
      mentions: mention 
    });
  }
};
