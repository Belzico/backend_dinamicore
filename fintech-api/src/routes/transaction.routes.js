const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { deposit, withdraw, transfer } = require('../controllers/transaction.controller');

router.post('/deposit', authMiddleware, deposit);
router.post('/withdraw', authMiddleware, withdraw);
router.post('/transfer', authMiddleware, transfer);

module.exports = router;
