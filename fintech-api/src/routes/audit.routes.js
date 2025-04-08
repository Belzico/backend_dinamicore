const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const { getAuditLog } = require('../controllers/audit.controller');

// Solo administradores
router.get('/', auth, checkRole('admin'), getAuditLog);

module.exports = router;
