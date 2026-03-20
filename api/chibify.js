const fs = require('fs');
const path = require('path');
const { fal } = require("@fal-ai/client");
require("dotenv").config();

// Persistent rate limiting via JSON file
const LIMITS_FILE = path.join(__dirname, '../data/ratelimits.json');
const LIMIT = 5; // 5 requests per day
const WINDOW = 24 * 60 * 60 * 1000; // 24 hours

// Ensure data directory exists
if (!fs.existsSync(path.dirname(LIMITS_FILE))) {
  fs.mkdirSync(path.dirname(LIMITS_FILE), { recursive: true });
}

function loadLimits() {
  try {
    if (fs.existsSync(LIMITS_FILE)) {
      const data = fs.readFileSync(LIMITS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading rate limits:", err);
  }
  return {};
}

function saveLimits(limits) {
  try {
    fs.writeFileSync(LIMITS_FILE, JSON.stringify(limits, null, 2));
  } catch (err) {
    console.error("Error saving rate limits:", err);
  }
}

function checkRateLimit(ip) {
  const limits = loadLimits();
  const now = Date.now();
  
  if (!limits[ip]) {
    limits[ip] = { count: 1, firstRequest: now };
    saveLimits(limits);
    return true;
  }
  
  const data = limits[ip];
  if (now - data.firstRequest > WINDOW) {
    // Reset window
    limits[ip] = { count: 1, firstRequest: now };
    saveLimits(limits);
    return true;
  }
  
  if (data.count < LIMIT) {
    data.count++;
    saveLimits(limits);
    return true;
  }
  
  return false;
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: "Rate limit exceeded (5/day). Try again tomorrow! ✨" });
  }

  const { image_url, prompt } = req.body;

  if (!image_url) {
    return res.status(400).json({ error: "image_url is required" });
  }

  try {
    // 1. Log the incoming URL from ImgBB
    console.log("Receiving ImgBB URL for Stable Flux-Dev:", image_url);

    // 2. Call the specialized Cartoonify model for true 3D cartoon/toy stylization
    const result = await fal.subscribe("fal-ai/cartoonify", {
  input: {
    image_url: image_url,
    // Enhanced prompt for the specific 3D-Chibi-Vinyl look
    prompt: "A high-end 3D Chibi designer toy, oversized head with giant expressive glossy eyes, tiny cute body, smooth matte vinyl texture, Pop Mart aesthetic, soft studio lighting, vibrant pastel colors, volumetric 3D render, Pixar-style character, clean 3D shapes, masterpiece, high detail",
    // To ensure it actually changes the shape of the person, ensure 'strength' is high
    image_size: "square_hd" 
  },
  logs: true
});

    return res.status(200).json(result);
  } catch (error) {
    console.error("Fal.ai Error:", error);
    
    // Fallback logic for various error states
    if (error.status === 403 || error.message.includes("balance") || process.env.USE_MOCK === "true") {
      console.log("Entering Mock Mode...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      return res.status(200).json({
        images: [{ url: "/chibi-image.jpg" }],
        mock: true,
        message: "Using Demo Mode (Mock AI)"
      });
    }

    // Capture the exact field that failed from Fal.ai for final polish
    const errorDetail = error.body && error.body.detail ? JSON.stringify(error.body.detail) : error.message;
    return res.status(500).json({ error: "AI transformation failed: " + errorDetail });
  }
};
