const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Получить публичный список желаний пользователя
router.get('/:publicId', publicController.getPublicWishlist);

// Зарезервировать подарок
router.post('/:publicId/wishes/:wishId/reserve', publicController.reserveWish);

// Отменить резервирование подарка
router.post('/:publicId/wishes/:wishId/unreserve', publicController.unreserveWish);

module.exports = router;

