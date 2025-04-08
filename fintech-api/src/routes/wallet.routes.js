const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createWallet,
  getWallets,
  getWalletById,
  getWalletHistory
} = require('../controllers/wallet.controller');

router.post('/', auth, createWallet);                // Crear nueva wallet
router.get('/', auth, getWallets);                   // Listar wallets del usuario
router.get('/:id', auth, getWalletById);             // Consultar una wallet específica
router.get('/:id/history', auth, getWalletHistory);  // Historial de transacciones

module.exports = router;
