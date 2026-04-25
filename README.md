<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>Savage Bot · README</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(145deg, #0b0c10 0%, #0f1117 100%);
            font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 2rem 1.5rem;
        }

        /* modern card / readme container */
        .readme-card {
            max-width: 880px;
            width: 100%;
            background: rgba(18, 20, 28, 0.85);
            backdrop-filter: blur(2px);
            border-radius: 2.5rem;
            border: 1px solid rgba(156, 163, 255, 0.2);
            box-shadow: 0 25px 45px -12px rgba(0, 0, 0, 0.6), 0 0 0 0.5px rgba(170, 130, 255, 0.15);
            overflow: hidden;
            transition: all 0.2s ease;
        }

        .readme-inner {
            padding: 2rem 2rem 2.2rem;
        }

        /* image banner / hero */
        .bot-hero {
            text-align: center;
            margin-bottom: 2rem;
        }

        .bot-image {
            max-width: 100%;
            border-radius: 2rem;
            box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5), 0 0 0 2px rgba(175, 135, 255, 0.2);
            transition: transform 0.2s;
            display: inline-block;
            background: #0a0c12;
        }

        .bot-image:hover {
            transform: scale(1.01);
        }

        /* purple animated typing zone */
        .typing-area {
            background: rgba(10, 12, 20, 0.7);
            border-radius: 1.8rem;
            padding: 1.4rem 2rem;
            margin: 1.8rem 0 2rem 0;
            border-left: 4px solid #c084fc;
            border-right: 1px solid rgba(192, 132, 252, 0.25);
            font-family: 'Fira Code', 'JetBrains Mono', 'SF Mono', monospace;
            font-weight: 500;
            font-size: 1.35rem;
            letter-spacing: -0.01em;
            backdrop-filter: blur(4px);
        }

        .typewriter {
            min-height: 5rem;
            word-break: break-word;
            color: #e2e8ff;
        }

        .cursor-blink {
            display: inline-block;
            width: 2px;
            background-color: #c084fc;
            margin-left: 2px;
            animation: blinkPurple 1s step-end infinite;
            vertical-align: middle;
        }

        @keyframes blinkPurple {
            0%, 100% { opacity: 1; background-color: #c084fc; box-shadow: 0 0 3px #d8b4fe;}
            50% { opacity: 0; background-color: #a855f7; }
        }

        .purple-text {
            color: #c27eff;
            text-shadow: 0 0 3px rgba(168, 85, 247, 0.3);
        }

        /* description lines */
        .tagline {
            font-size: 1rem;
            color: #b9c3e6;
            border-top: 1px dashed #2a2e42;
            padding-top: 1rem;
            margin: 0.5rem 0 1.6rem 0;
            text-align: center;
            font-weight: 450;
        }

        /* button container - clean, modern */
        .button-group {
            display: flex;
            flex-wrap: wrap;
            gap: 1.2rem;
            justify-content: center;
            margin: 2rem 0 1.2rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
            background: #12141e;
            border: 1px solid #2e2b48;
            padding: 0.85rem 2rem;
            border-radius: 60px;
            font-weight: 600;
            font-size: 1rem;
            font-family: inherit;
            color: #eef3ff;
            text-decoration: none;
            transition: all 0.25s ease;
            backdrop-filter: blur(4px);
            letter-spacing: 0.3px;
            cursor: pointer;
            box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }

        .btn-primary {
            background: linear-gradient(105deg, #6c2bd9 0%, #9b4dff 100%);
            border: none;
            color: white;
            box-shadow: 0 4px 14px rgba(108, 43, 217, 0.35);
        }

        .btn-primary:hover {
            background: linear-gradient(105deg, #7c3aed 0%, #aa66ff 100%);
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(139, 69, 255, 0.45);
        }

        .btn-secondary {
            background: #151b28d9;
            border: 1px solid #a07eff;
            color: #dbcaff;
        }

        .btn-secondary:hover {
            background: #1f2538;
            border-color: #bc96ff;
            transform: translateY(-2px);
            color: white;
        }

        /* masterpiece block */
        .masterpiece-note {
            text-align: center;
            margin-top: 2.2rem;
            padding: 1rem 0 0.2rem;
            font-style: italic;
            font-weight: 400;
            letter-spacing: 0.2px;
            color: #a9afcf;
            font-size: 0.9rem;
            border-top: 1px solid #272b3b;
            display: flex;
            justify-content: center;
            gap: 1.2rem;
            flex-wrap: wrap;
        }

        .masterpiece-note span {
            background: #0c0f18;
            padding: 0.25rem 1rem;
            border-radius: 40px;
            font-size: 0.8rem;
            font-family: monospace;
        }

        /* subtle footer */
        .footer-meta {
            font-size: 0.7rem;
            text-align: center;
            margin-top: 1.5rem;
            color: #4e547a;
        }

        @media (max-width: 560px) {
            .readme-inner {
                padding: 1.5rem;
            }
            .typewriter {
                font-size: 1rem;
            }
            .btn {
                padding: 0.7rem 1.4rem;
                font-size: 0.9rem;
            }
        }
    </style>
</head>
<body>

<div class="readme-card">
    <div class="readme-inner">
        
        <!-- image section with direct link (no emoji) -->
        <div class="bot-hero">
            <img class="bot-image" src="https://i.ibb.co/mC0MB68z/IMG-20260425-WA1076.webp" 
                 alt="Savage Bot banner" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/800x400?text=Savage+Bot+Art';"
                 style="width:100%; max-width:720px; object-fit:cover;">
        </div>

        <!-- animated purple typing + erasing section -->
        <div class="typing-area">
            <div class="typewriter" id="dynamicMessage">
                <span id="typeText"></span>
                <span class="cursor-blink" id="cursorSpan"> </span>
            </div>
        </div>

        <!-- short contextual info with 'masterpiece in creation' vibe -->
        <div class="tagline">
            <span class="purple-text">// high performance · cypher X ready · autonomous series</span>
        </div>

        <!-- cool buttons: direct links fork repo & pair site -->
        <div class="button-group">
            <a class="btn btn-primary" href="https://github.com/tysavage163/Savage-Tech" target="_blank" rel="noopener noreferrer">
                FORK REPO
            </a>
            <a class="btn btn-secondary" href="https://spencers-quantam-core.onrender.com" target="_blank" rel="noopener noreferrer">
                PAIR SITE
            </a>
        </div>

        <!-- masterpiece in creation line (exactly as requested - no emojis) -->
        <div class="masterpiece-note">
            <span>⚡ a masterpiece in creation</span>
            <span>⚡ precision built</span>
        </div>
        <div class="footer-meta">
            savage bot · baileys multidevice core
        </div>
    </div>
</div>

<script>
    // full text that types itself then erases again - purple tint
    // Required message: "a baileys multidevice WhatsApp bot ....created by Beck.... inspired by Meryl...."
    // exact formatting with spaces and dots
    const fullMessage = "a baileys multidevice WhatsApp bot ....created by Beck.... inspired by Meryl....";
    
    let step = 0;           // 0 = typing forward, 1 = erasing
    let currentText = "";
    let index = 0;          // position within fullMessage while typing/erasing
    let typingInterval = null;
    let isWaiting = false;
    
    const typeTextSpan = document.getElementById("typeText");
    const cursorSpan = document.getElementById("cursorSpan");
    
    // smooth delays: type speed 70ms, erase speed 45ms, pause before erasing 1400ms, pause before retype 700ms
    const TYPE_DELAY = 70;
    const ERASE_DELAY = 45;
    const PAUSE_BEFORE_ERASE = 1500;
    const PAUSE_BEFORE_RETYPE = 700;
    
    function updateDisplay() {
        if (typeTextSpan) {
            typeTextSpan.innerText = currentText;
        }
    }
    
    function startTyping() {
        if (typingInterval) clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (step === 0) {
                // TYPING MODE
                if (index < fullMessage.length) {
                    currentText += fullMessage.charAt(index);
                    index++;
                    updateDisplay();
                } else {
                    // fully typed -> stop typing, schedule erase after pause
                    clearInterval(typingInterval);
                    typingInterval = null;
                    isWaiting = true;
                    setTimeout(() => {
                        // switch to erase mode
                        step = 1;
                        isWaiting = false;
                        startErasing();
                    }, PAUSE_BEFORE_ERASE);
                }
            }
        }, TYPE_DELAY);
    }
    
    function startErasing() {
        if (typingInterval) clearInterval(typingInterval);
        typingInterval = setInterval(() => {
            if (step === 1) {
                if (currentText.length > 0) {
                    currentText = currentText.slice(0, -1);
                    index = currentText.length;
                    updateDisplay();
                } else {
                    // fully erased -> clear interval, wait, then retype again
                    clearInterval(typingInterval);
                    typingInterval = null;
                    isWaiting = true;
                    setTimeout(() => {
                        step = 0;          // back to typing
                        index = 0;
                        currentText = "";
                        updateDisplay();
                        isWaiting = false;
                        startTyping();      // infinite loop (types again)
                    }, PAUSE_BEFORE_RETYPE);
                }
            }
        }, ERASE_DELAY);
    }
    
    // initialize typing cycle on page load
    startTyping();
    
    // add small accent: ensure the cursor keeps purple animation (already in CSS)
    // also we want the text color to be purple-ish (already inherited purple-text from parent?)
    // dynamic area will have purple styling: force color.
    const dynamicDiv = document.getElementById("dynamicMessage");
    if (dynamicDiv) {
        dynamicDiv.style.color = "#c27eff";
        dynamicDiv.style.fontWeight = "500";
        dynamicDiv.style.textShadow = "0 0 1px rgba(160, 120, 255, 0.5)";
    }
    // make cursor span inline with background animation
    if (cursorSpan) {
        cursorSpan.style.display = "inline-block";
        cursorSpan.style.width = "2px";
        cursorSpan.style.height = "1.4rem";
        cursorSpan.style.backgroundColor = "#c084fc";
        cursorSpan.style.marginLeft = "2px";
        cursorSpan.style.verticalAlign = "middle";
        cursorSpan.style.borderRadius = "1px";
    }
</script>
</body>
</html>
