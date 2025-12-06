const User = require('../models/User');
const Wish = require('../models/Wish');
const auth = require('../middleware/auth');

exports.getPublicWishlist = async (req, res) => {
  try {
    const { publicId } = req.params;

    const user = await User.findOne({ publicId }).select('username publicId');
    if (!user) {
      return res.status(404).json({ error: 'Список желаний не найден' });
    }

    const wishes = await Wish.find({ user: user._id })
      .select('title image price reserved createdAt ')
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

exports.reserveWish = [auth, async (req, res) => {
  try {
    const { publicId, wishId } = req.params;

    const user = await User.findOne({ publicId });
    if (!user) {
      return res.status(404).json({ error: 'Список желаний не найден' });
    }

    const wish = await Wish.findOne({ 
      _id: wishId, 
      user: user._id 
    });

    if (!wish) {
      return res.status(404).json({ error: 'Подарок не найден' });
    }

    if (wish.reserved) {
      return res.status(400).json({ 
        error: 'Этот подарок уже зарезервирован' 
      });
    }

    wish.reserved = true;
    wish.reservedByUser = req.userId;
    await wish.save();

    res.json({
      message: 'Подарок успешно зарезервирован',
      wish: {
        _id: wish._id,
        title: wish.title,
        reserved: wish.reserved
      }
    });
  } catch (error) {
    console.error('Ошибка резервирования:', error);
    res.status(500).json({ 
      error: 'Ошибка при резервировании подарка',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}];

exports.unreserveWish = [auth, async (req, res) => {
  try {
    const { publicId, wishId } = req.params;

    const user = await User.findOne({ publicId });
    if (!user) {
      return res.status(404).json({ error: 'Список желаний не найден' });
    }

    const wish = await Wish.findOne({ 
      _id: wishId, 
      user: user._id 
    });

    if (!wish) {
      return res.status(404).json({ error: 'Подарок не найден' });
    }

    if (wish.reservedByUser && wish.reservedByUser.toString() !== req.userId.toString()) {
      return res.status(403).json({ 
        error: 'Вы не можете отменить чужое резервирование' 
      });
    }

    wish.reserved = false;
    wish.reservedByUser = null;
    await wish.save();

    res.json({
      message: 'Резервирование отменено',
      wish: {
        _id: wish._id,
        title: wish.title,
        reserved: wish.reserved
      }
    });
  } catch (error) {
    console.error('Ошибка отмены резервирования:', error);
    res.status(500).json({ 
      error: 'Ошибка при отмене резервирования',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}];

