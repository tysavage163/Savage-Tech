const fontMaps = {
    default: (t) => t,
    smallcaps: (t) => t.toUpperCase().replace(/[A-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D00)),
    upsidedown: (t) => [...t].reverse().map(c => 'ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)] || c).join(''),
    circled: (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x24D0)),
    gothic: (t) => t.replace(/[A-Za-z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x1D504 - 65)),
    squared: (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F130 - 65)),
    strikethrough: (t) => t.split('').map(c => c + '\u0336').join(''),
    parenthesized: (t) => t.split('').map(c => `(${c})`).join(''),
    bold: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D5D4 - 65)),
    italic: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D608 - 65)),
    doublestruck: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D538 - 65)),
    monospace: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D670 - 65)),
    script: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D4B0 - 65)),
    sansserif: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D5A0 - 65)),
    underlined: (t) => t.split('').map(c => c + '\u0332').join(''),
    doubleunderlined: (t) => t.split('').map(c => c + '\u0333').join(''),
    overlined: (t) => t.split('').map(c => c + '\u0305').join(''),
    wavyunderlined: (t) => t.split('').map(c => c + '\u0330').join(''),
    negativecircled: (t) => t.replace(/[0-9]/g, d => ['⓿','❶','❷','❸','❹','❺','❻','❼','❽','❾'][parseInt(d)]),
    fullwidth: (t) => t.replace(/[!-~]/g, c => String.fromCharCode(c.charCodeAt(0) + 0xFEE0)),
    superscript: (t) => t.replace(/[a-zA-Z0-9]/g, c => {
        const sup = {'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','a':'ᵃ','b':'ᵇ','c':'ᶜ','d':'ᵈ','e':'ᵉ','f':'ᶠ','g':'ᵍ','h':'ʰ','i':'ⁱ','j':'ʲ','k':'ᵏ','l':'ˡ','m':'ᵐ','n':'ⁿ','o':'ᵒ','p':'ᵖ','q':'ᵠ','r':'ʳ','s':'ˢ','t':'ᵗ','u':'ᵘ','v':'ᵛ','w':'ʷ','x':'ˣ','y':'ʸ','z':'ᶻ','A':'ᴬ','B':'ᴮ','C':'ᶜ','D':'ᴰ','E':'ᴱ','F':'ᶠ','G':'ᴳ','H':'ᴴ','I':'ᴵ','J':'ᴶ','K':'ᴷ','L':'ᴸ','M':'ᴹ','N':'ᴺ','O':'ᴼ','P':'ᴾ','Q':'ᵠ','R':'ᴿ','S':'ˢ','T':'ᵀ','U':'ᵁ','V':'ⱽ','W':'ᵂ','X':'ˣ','Y':'ʸ','Z':'ᶻ'};
        return sup[c] || c;
    }),
    subscript: (t) => t.replace(/[a-zA-Z0-9]/g, c => {
        const sub = {'0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉','a':'ₐ','b':'ₔ','c':'꜀','d':'ᵢ','e':'ₑ','f':'բ','g':'₉','h':'ₕ','i':'ᵢ','j':'ⱼ','k':'ₖ','l':'ₗ','m':'ₘ','n':'ₙ','o':'ₒ','p':'ₚ','q':'₉','r':'ᵣ','s':'ₛ','t':'ₜ','u':'ᵤ','v':'ᵥ','w':'w','x':'ₓ','y':'ᵧ','z':'₂'};
        return sub[c] || c;
    }),
    regional: (t) => t.toUpperCase().replace(/[A-Z]/g, c => String.fromCodePoint(0x1F1E6 + (c.charCodeAt(0) - 65))),
    dotted: (t) => t.split('').map(c => c + '\u0307').join(''),
    bubble: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F170 - 65)),
    mirror: (t) => [...t].reverse().map(c => 'ɐqɔpǝɟƃɥıɾʞlɯuodbɹsʇnʌʍxʎz'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)] || c).join(''),
    zalgo: (t) => t.split('').map(c => c + '\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313\u0314\u0315\u0316\u0317\u0318\u0319\u031A\u031B\u031C\u031D\u031E\u031F').join(''),
    tilde: (t) => t.split('').map(c => c + '\u0303').join(''),
    currency: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F4B0 - 65)),
    arrows: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F800 - 65)),
    emoticon: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1F600 - 65)),
    asian: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0xFF21 - 65)),
    weird: (t) => t.split('').map(c => String.fromCharCode(c.charCodeAt(0) + 0x1000)).join(''),
    slashed: (t) => t.split('').map(c => c + '\u0338').join(''),
    circlenegative: (t) => t.replace(/[0-9]/g, d => ['⓿','❶','❷','❸','❹','❺','❻','❼','❽','❾'][parseInt(d)]),
    leet: (t) => t.replace(/[a-zA-Z]/g, c => ({a:'4',b:'8',c:'(',d:'|)',e:'3',f:'|=',g:'6',h:'#',i:'1',j:'_|',k:'|<',l:'|_',m:'|\\/|',n:'|\\|',o:'0',p:'|*',q:'(,)',r:'|2',s:'$',t:'7',u:'|_|',v:'\\/',w:'\\/\\/',x:'><',y:'`/',z:'2'})[c.toLowerCase()] || c),
    diacritics: (t) => t.split('').map(c => c + '\u0300\u0301\u0302').join(''),
    mathbold: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D400 - 65)),
    greek: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x0370 - 65)),
    cyrillic: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x0430 - 97)),
    braille: (t) => t.replace(/[a-z]/g, c => String.fromCodePoint(0x2800 + '⠁⠃⠉⠙⠑⠋⠛⠓⠊⠚⠅⠇⠍⠝⠕⠏⠟⠗⠎⠞⠥⠧⠺⠭⠽⠵'['abcdefghijklmnopqrstuvwxyz'.indexOf(c)])),
    hieroglyphs: (t) => t.replace(/[a-zA-Z]/g, () => '𓀀𓀁𓀂'),
    runic: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCodePoint(0x16A0 + ('a'.charCodeAt(0)))),
    morse: (t) => t.replace(/[a-zA-Z0-9]/g, c => ({'a':'.-','b':'-...','c':'-.-.','d':'-..','e':'.','f':'..-.','g':'--.','h':'....','i':'..','j':'.---','k':'-.-','l':'.-..','m':'--','n':'-.','o':'---','p':'.--.','q':'--.-','r':'.-.','s':'...','t':'-','u':'..-','v':'...-','w':'.--','x':'-..-','y':'-.--','z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.'})[c.toLowerCase()] + ' '),
    binary: (t) => t.split('').map(c => c.charCodeAt(0).toString(2)).join(' '),
    roman: (t) => t.replace(/[0-9]/g, d => ['','I','II','III','IV','V','VI','VII','VIII','IX'][parseInt(d)]),
    mathscript: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D4C0 - 65)),
    frakturbold: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D56C - 65)),
    cherokee: (t) => t.replace(/[a-zA-Z]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x13A0 - 97)),
    mathalpha: (t) => t.replace(/[A-Za-z]/g, c => String.fromCodePoint(c.charCodeAt(0) + 0x1D5A0 - 65))
};

module.exports = {
    name: 'setfont',
    category: 'owner',
    description: 'Change bot\'s global font (owner only)',
    async execute(sock, msg, args, { isArchitect }) {
        const from = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isSudo = global.sudo && (global.sudo.has ? global.sudo.has(sender) : global.sudo.includes(sender));
        if (!isArchitect && !isSudo) {
            return sock.sendMessage(from, { text: '❌ Owner or sudo only command.' }, { quoted: msg });
        }

        const fontName = args[0]?.toLowerCase();
        if (!fontName || fontName === 'list') {
            const available = Object.keys(fontMaps).join(', ');
            await sock.sendMessage(from, { text: `📝 *Available fonts:*\n${available}\n\nExample: .setfont bold` }, { quoted: msg });
            return;
        }
        if (!fontMaps[fontName]) {
            await sock.sendMessage(from, { text: `❌ Unknown font: ${fontName}\nUse .setfont list` }, { quoted: msg });
            return;
        }
        global.botFont = fontName;
        await sock.sendMessage(from, { text: `✅ Bot font globally set to: ${fontName}\nAll my replies everywhere will use this font.` }, { quoted: msg });
    }
};
