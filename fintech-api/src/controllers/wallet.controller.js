const pool = require('../config/db');

// Crear nueva wallet
exports.createWallet = async (req, res) => {
  try {
    const { currency } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    if (!currency) {
      return res.status(400).json({ message: 'Currency is required' });
    }

    const insertQuery = `
      INSERT INTO fintech.wallets (user_id, currency)
      VALUES ($1, $2)
      RETURNING wallet_id, balance, currency
    `;
    const { rows } = await pool.query(insertQuery, [userId, currency]);

    return res.status(201).json({
      message: 'Wallet created successfully',
      wallet: rows[0]
    });
  } catch (error) {
    console.error('Error creating wallet:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Ver todas las wallets del usuario
exports.getWallets = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT wallet_id, balance, currency, created_at
       FROM fintech.wallets
       WHERE user_id = $1`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching wallets' });
  }
};

// Ver una wallet por ID
exports.getWalletById = async (req, res) => {
  const userId = req.user.userId;
  const walletId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT wallet_id, balance, currency
       FROM fintech.wallets
       WHERE user_id = $1 AND wallet_id = $2`,
      [userId, walletId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching wallet' });
  }
};

// Historial de transacciones de una wallet
exports.getWalletHistory = async (req, res) => {
  const userId = req.user.userId;
  const walletId = req.params.id;

  try {
    // Confirmar que la wallet pertenece al usuario
    const walletCheck = await pool.query(
      `SELECT wallet_id FROM fintech.wallets WHERE user_id = $1 AND wallet_id = $2`,
      [userId, walletId]
    );
    if (walletCheck.rows.length === 0) return res.status(404).json({ error: 'Wallet not found' });

    const result = await pool.query(
      `SELECT transaction_id, amount, transaction_type, wallet_id_dest, created_at
       FROM fintech.transactions
       WHERE wallet_id = $1 OR wallet_id_dest = $1
       ORDER BY created_at DESC`,
      [walletId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error fetching wallet history' });
  }
};
