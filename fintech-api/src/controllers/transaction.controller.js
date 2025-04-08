const pool = require('../config/db');

exports.deposit = async (req, res) => {
  const { wallet_id, amount } = req.body;
  const userId = req.user.userId;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: 'wallet_id and amount are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM fintech.wallets WHERE wallet_id = $1 AND user_id = $2',
      [wallet_id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to use this wallet' });
    }

    await pool.query('BEGIN');

    const txResult = await pool.query(
      'SELECT procesar_transaccion($1, NULL, $2, $3)',
      [wallet_id, amount, 'deposit']
    );

    // Auditoría
    await pool.query(`
      INSERT INTO fintech.audit_log (accion, tabla_afectada, registro_id, usuario_id, detalle)
      VALUES ('deposito', 'transactions', NULL, $1, $2)
    `, [
      userId,
      `Depósito de ${amount} a wallet ${wallet_id}`
    ]);

    await pool.query('COMMIT');
    return res.status(200).json({ message: 'Deposit successful' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: 'Transaction failed' });
  }
};

exports.withdraw = async (req, res) => {
  const { wallet_id, amount } = req.body;
  const userId = req.user.userId;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: 'wallet_id and amount are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM fintech.wallets WHERE wallet_id = $1 AND user_id = $2',
      [wallet_id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to use this wallet' });
    }

    await pool.query('BEGIN');

    await pool.query(
      'SELECT procesar_transaccion($1, NULL, $2, $3)',
      [wallet_id, amount, 'withdraw']
    );

    await pool.query(`
      INSERT INTO fintech.audit_log (accion, tabla_afectada, registro_id, usuario_id, detalle)
      VALUES ('retiro', 'transactions', NULL, $1, $2)
    `, [
      userId,
      `Retiro de ${amount} desde wallet ${wallet_id}`
    ]);

    await pool.query('COMMIT');
    return res.status(200).json({ message: 'Withdraw successful' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: error.message || 'Transaction failed' });
  }
};

exports.transfer = async (req, res) => {
  const { wallet_id, wallet_id_dest, amount } = req.body;
  const userId = req.user.userId;

  if (!wallet_id || !wallet_id_dest || !amount) {
    return res.status(400).json({ error: 'wallet_id, wallet_id_dest and amount are required' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM fintech.wallets WHERE wallet_id = $1 AND user_id = $2',
      [wallet_id, userId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized to transfer from this wallet' });
    }

    await pool.query('BEGIN');

    await pool.query(
      'SELECT procesar_transaccion($1, $2, $3, $4)',
      [wallet_id, wallet_id_dest, amount, 'transfer']
    );

    await pool.query(`
      INSERT INTO fintech.audit_log (accion, tabla_afectada, registro_id, usuario_id, detalle)
      VALUES ('transferencia', 'transactions', NULL, $1, $2)
    `, [
      userId,
      `Transferencia de ${amount} desde wallet ${wallet_id} a wallet ${wallet_id_dest}`
    ]);

    await pool.query('COMMIT');
    return res.status(200).json({ message: 'Transfer successful' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: error.message || 'Transaction failed' });
  }
};
