const express = require('express');
const router = express.Router();
const wishController = require('../controllers/wishController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authMiddleware);

router.get('/', wishController.getMyWishes);

router.post('/', upload.single('image'), wishController.createWish);

router.put('/:id', upload.single('image'), wishController.updateWish);

router.delete('/:id', wishController.deleteWish);

module.exports = router;

