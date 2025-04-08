const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Verifica si ya existe el usuario
    const userExist = await pool.query('SELECT user_id FROM fintech.users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hashea la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserta el nuevo usuario (rol por defecto = 'user')
    const insertQuery = `
      INSERT INTO fintech.users (first_name, last_name, email, hashed_password)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, role
    `;
    const result = await pool.query(insertQuery, [first_name, last_name, email, hashedPassword]);
    const user = result.rows[0];

    //console.log('JWT_SECRET:', process.env.JWT_SECRET);

    // Genera el token con el rol incluido
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: user.user_id,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = `
      SELECT user_id, hashed_password, role
      FROM fintech.users
      WHERE email = $1
    `;
    const { rows } = await pool.query(findUser, [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.hashed_password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
