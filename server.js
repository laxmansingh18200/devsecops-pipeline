// server.js - Minimal Express app with optional Mongo connection
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/devdb';

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Mongo connected'))
  .catch(err => console.warn('Mongo connection error:', err.message));

app.get('/', (req, res) => {
  res.json({ message: 'Hello from secure Node.js app' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
