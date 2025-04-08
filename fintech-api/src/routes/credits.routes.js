const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const checkRole = require('../middlewares/checkRole');
const controller = require('../controllers/credit.controller');

// Usuarios normales
router.post('/apply', auth, controller.applyCredit);
router.get('/my', auth, controller.getMyCredits);
router.post('/:id/pay', auth, controller.payCredit);


// Admins
router.get('/', auth, checkRole('admin'), controller.getAllCredits);
router.put('/:id/approve', auth, checkRole('admin'), controller.approveCredit);
router.put('/:id/decline', auth, checkRole('admin'), controller.rejectCredit);
router.get('/dashboard', auth, checkRole('admin'), controller.getCreditDashboard);
router.put('/:id/default', auth, checkRole('admin'), controller.markAsDefault);


module.exports = router;
