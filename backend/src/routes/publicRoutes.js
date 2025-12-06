const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/:publicId', publicController.getPublicWishlist);
router.post('/:publicId/wishes/:wishId/reserve', ...publicController.reserveWish);
router.post('/:publicId/wishes/:wishId/unreserve', ...publicController.unreserveWish);

module.exports = router;

