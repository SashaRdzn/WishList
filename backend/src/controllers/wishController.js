const Wish = require('../models/Wish');
const path = require('path');
const fs = require('fs');

// Получить все подарки текущего пользователя
exports.getMyWishes = async (req, res) => {
  try {
    const wishes = await Wish.find({ user: req.userId })
      .sort({ createdAt: -1 });
    res.json(wishes);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при получении подарков',
      message: error.message 
    });
  }
};

// Создать новый подарок
exports.createWish = async (req, res) => {
  try {
    const { title } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Название подарка обязательно' 
      });
    }

    if (title.length > 100) {
      return res.status(400).json({ 
        error: 'Название не должно превышать 100 символов' 
      });
    }

    // Обработка загруженного файла
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const wish = new Wish({
      title: title.trim(),
      image: imagePath,
      user: req.userId
    });

    await wish.save();
    res.status(201).json(wish);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при создании подарка',
      message: error.message 
    });
  }
};

// Обновить подарок
exports.updateWish = async (req, res) => {
  try {
    const { title } = req.body;
    const wish = await Wish.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!wish) {
      return res.status(404).json({ 
        error: 'Подарок не найден' 
      });
    }

    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        return res.status(400).json({ 
          error: 'Название подарка обязательно' 
        });
      }
      wish.title = title.trim();
    }

    // Если загружено новое изображение
    if (req.file) {
      // Удаляем старое изображение, если оно есть
      if (wish.image) {
        const oldImagePath = path.join(__dirname, '..', '..', 'public', wish.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      wish.image = `/uploads/${req.file.filename}`;
    }

    await wish.save();
    res.json(wish);
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при обновлении подарка',
      message: error.message 
    });
  }
};

// Удалить подарок
exports.deleteWish = async (req, res) => {
  try {
    const wish = await Wish.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!wish) {
      return res.status(404).json({ 
        error: 'Подарок не найден' 
      });
    }

    // Удаляем изображение, если оно есть
    if (wish.image) {
      const imagePath = path.join(__dirname, '..', '..', 'public', wish.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Wish.findByIdAndDelete(req.params.id);
    res.json({ message: 'Подарок успешно удален' });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка при удалении подарка',
      message: error.message 
    });
  }
};

