require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');

const PORT = process.env.PORT || 5005;
const CLIENT_ORIGIN = process.env.CLIENT_URL || 'http://localhost:5173';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN.split(',').map((origin) => origin.trim()),
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection', err);
});
