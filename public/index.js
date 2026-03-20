document.addEventListener('DOMContentLoaded', () => {
    // Bubble Generator
    const bubbleContainer = document.getElementById('bubble-container');
    const colors = ["#FFC0CB", "#E6F0FF", "#FF8C00", "#FFF44F"]; // Pink, Blue, Orange, Yellow

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
    setInterval(createBubble, 600);

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

    // Chibifier Logic
    const uploadState = document.getElementById('upload-state');
    const processingState = document.getElementById('processing-state');
    const resultState = document.getElementById('result-state');
    const resultImage = document.getElementById('result-image');
    const originalImageDisplay = document.getElementById('original-image-display');
    const statusText = document.getElementById('status-text');
    const progressFill = document.querySelector('.progress-fill');
    
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');
    const resetBtn = document.getElementById('reset-btn');

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Set original image preview
            if (originalImageDisplay) {
                originalImageDisplay.src = URL.createObjectURL(file);
            }

            // Show processing
            uploadState.classList.add('hidden');
            processingState.classList.remove('hidden');
            if (progressFill) progressFill.style.width = '10%';
            
            const statuses = [
                "Gathering Pixie Dust...",
                "Sketching Chibi lines...",
                "Adding Sparkle & Magic...",
                "Polishing the Cuteness...",
                "Floating to your screen..."
            ];
            
            let statusIdx = 0;
            statusText.innerText = statuses[0];
            
            const statusInterval = setInterval(() => {
                statusIdx = (statusIdx + 1) % statuses.length;
                statusText.innerText = statuses[statusIdx];
                if (progressFill) {
                    const progress = 10 + (statusIdx * 15);
                    progressFill.style.width = `${progress}%`;
                }
            }, 2000);

            try {
                // 1. Upload to ImgBB first (Stable URL for AI)
                statusText.innerText = "Hosting your photo... 📸";
                const imgbbUrl = await uploadToImgBB(file);
                
                statusText.innerText = "Sprinkling Chibi Magic... ✨";
                
                const response = await fetch('/api/chibify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_url: imgbbUrl })
                });

                const data = await response.json();
                clearInterval(statusInterval);

                if (!response.ok) {
                    throw new Error(data.error || "Transformation failed");
                }

                // Support both structured and direct response formats
                const images = data.images || (data.data && data.data.images);
                
                if (images && images.length > 0) {
                    resultImage.src = images[0].url;
                } else {
                    throw new Error("No image generated. Please try again.");
                }
                
                if (progressFill) progressFill.style.width = '100%';
                
                setTimeout(() => {
                    processingState.classList.add('hidden');
                    resultState.classList.remove('hidden');
                }, 500);
                
                if (data.mock) {
                    console.info("💡 Running in Demo Mode");
                    statusText.innerText = "Demo complete! (Exhausted credits)";
                    statusText.style.color = "#FF6B6B"; 
                } else {
                    statusText.innerText = "Chibi Transformation Complete! 🎉";
                    statusText.style.color = ""; // Reset color
                }

            } catch (error) {
                clearInterval(statusInterval);
                processingState.classList.add('hidden');
                uploadState.classList.remove('hidden');
                console.error("Transformation Error:", error);
                alert("Oops! " + error.message);
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resultState.classList.add('hidden');
            processingState.classList.add('hidden');
            uploadState.classList.remove('hidden');
            fileInput.value = '';
            if (progressFill) progressFill.style.width = '0%';
        });
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = resultImage.src;
            link.download = 'my-chibi.jpg';
            link.click();
        });
    }

    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const text = encodeURIComponent("Just got Chibified on Chibi Revolution! 🌟 Join the revolution at chibi-revolution.com $CHIBI");
            const url = `https://twitter.com/intent/tweet?text=${text}`;
            window.open(url, '_blank');
        });
    }

    // Copy Image
    const copyImgBtn = document.getElementById('copy-img-btn');
    if (copyImgBtn) {
        copyImgBtn.addEventListener('click', async () => {
            if (!resultImage.src) return;
            
            try {
                copyImgBtn.innerText = "⏳ Copying...";
                const response = await fetch(resultImage.src);
                const blob = await response.blob();
                
                // Chrome and Safari support ClipboardItem
                const item = new ClipboardItem({ 'image/png': blob });
                await navigator.clipboard.write([item]);
                
                copyImgBtn.innerText = "✅ Copied!";
                setTimeout(() => copyImgBtn.innerText = "📋 Copy Image", 2000);
            } catch (err) {
                console.error("Copy failed:", err);
                copyImgBtn.innerText = "❌ Failed";
                setTimeout(() => copyImgBtn.innerText = "📋 Copy Image", 2000);
                alert("Could not copy image automatically. Try right-clicking and 'Copy Image'.");
            }
        });
    }

    async function uploadToImgBB(file) {
        const apiKey = 'cf1870782c3383ca7307327f9b56d04b';
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            if (data.success) {
                return data.data.url;
            } else {
                throw new Error("ImgBB upload failed: " + data.error.message);
            }
        } catch (error) {
            console.error("ImgBB Error:", error);
            throw new Error("Failed to host image. Please try again.");
        }
    }
});
