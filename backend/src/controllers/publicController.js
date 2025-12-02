const User = require('../models/User');
const Wish = require('../models/Wish');

// Получить публичную информацию о пользователе и его подарках
exports.getPublicWishlist = async (req, res) => {
  try {
    const { publicId } = req.params;

    // Найти пользователя по публичному ID
    const user = await User.findOne({ publicId }).select('username publicId');
    if (!user) {
      return res.status(404).json({ error: 'Список желаний не найден' });
    }

    // Получить все подарки пользователя
    const wishes = await Wish.find({ user: user._id })
      .select('title image reserved reservedBy createdAt')
      .sort({ createdAt: -1 });

    res.json({
      user: {
        username: user.username,
        publicId: user.publicId
      },
      wishes
    });
  } catch (error) {
    console.error('Ошибка получения публичного списка:', error);
    res.status(500).json({ 
      error: 'Ошибка при получении списка желаний',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Зарезервировать подарок
exports.reserveWish = async (req, res) => {
  try {
    const { publicId, wishId } = req.params;
    const { reservedBy } = req.body;

    if (!reservedBy || reservedBy.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Имя обязательно для резервирования' 
      });
    }

    if (reservedBy.length > 50) {
      return res.status(400).json({ 
        error: 'Имя не должно превышать 50 символов' 
      });
    }

    // Найти пользователя по публичному ID
    const user = await User.findOne({ publicId });
    if (!user) {
      return res.status(404).json({ error: 'Список желаний не найден' });
    }

    // Найти подарок
    const wish = await Wish.findOne({ 
      _id: wishId, 
      user: user._id 
    });

    if (!wish) {
      return res.status(404).json({ error: 'Подарок не найден' });
    }

    // Проверка, не зарезервирован ли уже
    if (wish.reserved) {
      return res.status(400).json({ 
        error: 'Этот подарок уже зарезервирован' 
      });
    }

    // Резервируем подарок
    wish.reserved = true;
    wish.reservedBy = reservedBy.trim();
    await wish.save();

    res.json({
      message: 'Подарок успешно зарезервирован',
      wish: {
        _id: wish._id,
        title: wish.title,
        reserved: wish.reserved,
        reservedBy: wish.reservedBy
      }
    });
  } catch (error) {
    console.error('Ошибка резервирования:', error);
    res.status(500).json({ 
      error: 'Ошибка при резервировании подарка',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Отменить резервирование подарка
exports.unreserveWish = async (req, res) => {
  try {
    const { publicId, wishId } = req.params;

    // Найти пользователя по публичному ID
    const user = await User.findOne({ publicId });
    if (!user) {
      return res.status(404).json({ error: 'Список желаний не найден' });
    }

    // Найти подарок
    const wish = await Wish.findOne({ 
      _id: wishId, 
      user: user._id 
    });

    if (!wish) {
      return res.status(404).json({ error: 'Подарок не найден' });
    }

    // Отменяем резервирование
    wish.reserved = false;
    wish.reservedBy = null;
    await wish.save();

    res.json({
      message: 'Резервирование отменено',
      wish: {
        _id: wish._id,
        title: wish.title,
        reserved: wish.reserved,
        reservedBy: wish.reservedBy
      }
    });
  } catch (error) {
    console.error('Ошибка отмены резервирования:', error);
    res.status(500).json({ 
      error: 'Ошибка при отмене резервирования',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

