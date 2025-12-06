const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./database/connect');

const authRoutes = require('./routes/authRoutes');
const wishRoutes = require('./routes/wishRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

connectDB();

const corsOptions = {
  origin: [
    'https://podarok228.netlify.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://podarok.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/wishes', wishRoutes);
app.use('/api/public', publicRoutes);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Сервер работает'
  });
});

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    path: req.path,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;