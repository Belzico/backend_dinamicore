const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');
const { registerRules, loginRules, validate } = require('../middlewares/validateAuth');

const router = Router();

// Con validaciones integradas
router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);

module.exports = router;
