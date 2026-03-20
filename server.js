const express = require('express');
const cors = require('cors');
const path = require('path');
const chibifyHandler = require('./api/chibify');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// API Route
app.post('/api/chibify', chibifyHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
