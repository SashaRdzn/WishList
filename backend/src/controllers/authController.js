const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Логин и пароль обязательны' 
      });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ 
        error: 'Логин должен быть от 3 до 20 символов' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль должен быть не менее 6 символов' 
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Пользователь с таким логином уже существует' 
      });
    }

    const user = new User({ username, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstError = Object.values(error.errors)[0];
      return res.status(400).json({ 
        error: firstError.message || 'Ошибка валидации'
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: 'Пользователь с таким логином уже существует' 
      });
    }

    console.error('Ошибка регистрации:', error);
    res.status(500).json({ 
      error: 'Ошибка при регистрации',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Внутренняя ошибка сервера'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Логин и пароль обязательны' 
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный логин или пароль' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Неверный логин или пароль' 
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Успешная авторизация',
      token,
      user: {
        id: user._id,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при авторизации',
      message: error.message 
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    let user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    if (!user.publicId) {
      const crypto = require('crypto');
      let publicId;
      let isUnique = false;
      while (!isUnique) {
        publicId = crypto.randomBytes(6).toString('hex');
        const existingUser = await User.findOne({ publicId });
        if (!existingUser) {
          isUnique = true;
        }
      }
      user.publicId = publicId;
      await user.save();
    }
    
    res.json({
      id: user._id,
      username: user.username,
      publicId: user.publicId,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении данных пользователя',
      message: error.message 
    });
  }
};

