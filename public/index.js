document.addEventListener('DOMContentLoaded', () => {
    // Bubble Generator
    const bubbleContainer = document.getElementById('bubble-container');
    const colors = ['rgba(253, 184, 19, 0.2)', 'rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)'];

    function createBubble() {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        const size = Math.random() * 60 + 20 + 'px';
        bubble.style.width = size;
        bubble.style.height = size;
        
        bubble.style.left = Math.random() * 100 + 'vw';
        bubble.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const duration = Math.random() * 5 + 5 + 's';
        bubble.style.animationDuration = duration;
        
        bubbleContainer.appendChild(bubble);
        
        setTimeout(() => {
            bubble.remove();
        }, parseFloat(duration) * 1000);
    }

    // Spawn bubbles periodically
    setInterval(createBubble, 800);

    // Initial bubbles
    for(let i = 0; i < 10; i++) {
        createBubble();
    }

    // Reveal on Scroll
    const reveals = document.querySelectorAll('.reveal');
    const revealOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    reveals.forEach(reveal => {
        revealObserver.observe(reveal);
    });

    // Add playful log
    console.log("%c🌟 Chibi Revolution Initialized! 🌟", "color: #FDB813; font-size: 20px; font-weight: bold; background: #4B3621; padding: 10px; border-radius: 10px;");

    // CA Copy Logic
    const copyBtn = document.getElementById('copy-btn');
    const caValue = "0x1aD797dAa9034A34e634B398c82b25F249280673";

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(caValue).then(() => {
                const originalText = copyBtn.innerText;
                copyBtn.innerText = "COPIED! ✨";
                copyBtn.style.backgroundColor = colors[0]; // Gold color
                
                setTimeout(() => {
                    copyBtn.innerText = originalText;
                    copyBtn.style.backgroundColor = ''; 
                }, 2000);
            });
        });
    }
});
