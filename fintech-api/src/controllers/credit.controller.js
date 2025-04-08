const pool = require('../config/db');

// Usuario solicita un crédito
exports.applyCredit = async (req, res) => {
  try {
    const { amount, interest_rate } = req.body;
    if (!amount || !interest_rate) {
      return res.status(400).json({ error: 'Amount and interest rate are required' });
    }

    const result = await pool.query(`
      INSERT INTO fintech.credits (user_id, amount, interest_rate)
      VALUES ($1, $2, $3)
      RETURNING credit_id
    `, [req.user.userId, amount, interest_rate]);

    //console.log('Resultado del INSERT:', result.rows);

    return res.status(201).json({ message: 'Solicitud recibida', credit_id: result.rows[0].credit_id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Usuario ve sus créditos
exports.getMyCredits = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM fintech.credits WHERE user_id = $1
    `, [req.user.userId]);

    return res.status(200).json({ credits: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin aprueba un crédito solo si está pendiente
exports.approveCredit = async (req, res) => {
  try {
    const creditId = req.params.id;

    const result = await pool.query(`
      UPDATE fintech.credits
      SET status = 'APPROVED', approved_at = CURRENT_TIMESTAMP
      WHERE credit_id = $1 AND status = 'PENDING'
      RETURNING credit_id
    `, [creditId]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'El crédito no está en estado PENDING o no existe' });
    }

    return res.status(200).json({ message: `Crédito ${creditId} aprobado` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin rechaza un crédito solo si está pendiente
exports.rejectCredit = async (req, res) => {
  try {
    const creditId = req.params.id;

    const result = await pool.query(`
      UPDATE fintech.credits
      SET status = 'REJECTED'
      WHERE credit_id = $1 AND status = 'PENDING'
      RETURNING credit_id
    `, [creditId]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'El crédito no está en estado PENDING o no existe' });
    }

    return res.status(200).json({ message: `Crédito ${creditId} rechazado` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin marca un crédito como DEFAULT
exports.markAsDefault = async (req, res) => {
  try {
    const creditId = req.params.id;

    const result = await pool.query(`
      UPDATE fintech.credits
      SET status = 'DEFAULT'
      WHERE credit_id = $1 AND status = 'APPROVED'
      RETURNING credit_id
    `, [creditId]);

    if (result.rowCount === 0) {
      return res.status(400).json({ error: 'El crédito no está aprobado o no existe' });
    }

    return res.status(200).json({ message: `Crédito ${creditId} marcado como DEFAULT` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin ve todos los créditos
exports.getAllCredits = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fintech.credits');
    return res.status(200).json({ credits: result.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin ve un dashboard resumen (simplificado)
exports.getCreditDashboard = async (_req, res) => {
  try {
    const summary = await pool.query(`
      SELECT status, COUNT(*) AS count, SUM(amount) AS total
      FROM fintech.credits
      GROUP BY status
    `);
    return res.status(200).json({ dashboard: summary.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

// Usuario paga un crédito
exports.payCredit = async (req, res) => {
  const creditId = req.params.id;
  const { wallet_id, amount } = req.body;

  if (!wallet_id || !amount) {
    return res.status(400).json({ error: 'wallet_id and amount are required' });
  }

  try {
    await pool.query('BEGIN');

    // 1. Verificar crédito
    const creditRes = await pool.query(`
      SELECT amount FROM fintech.credits
      WHERE credit_id = $1 AND user_id = $2 AND status = 'APPROVED'
    `, [creditId, req.user.userId]);

    if (creditRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Crédito no encontrado o no autorizado' });
    }

    const totalCredito = parseFloat(creditRes.rows[0].amount);

    // 2. Calcular pagos previos
    const pagoRes = await pool.query(`
      SELECT COALESCE(SUM(payment_amount), 0) AS total_pagado
      FROM fintech.credit_payments
      WHERE credit_id = $1
    `, [creditId]);

    const pagado = parseFloat(pagoRes.rows[0].total_pagado);
    const restante = totalCredito - pagado;

    if (restante <= 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Este crédito ya está completamente pagado' });
    }

    // 3. Verificar wallet del usuario y bloquearla
    const walletRes = await pool.query(`
      SELECT balance FROM fintech.wallets
      WHERE wallet_id = $1 AND user_id = $2
      FOR UPDATE
    `, [wallet_id, req.user.userId]);

    if (walletRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(403).json({ error: 'La wallet no pertenece al usuario' });
    }

    const balance = parseFloat(walletRes.rows[0].balance);
    if (balance <= 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente en la wallet' });
    }

    const aPagar = Math.min(amount, restante);

    if (aPagar > balance) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Saldo insuficiente para cubrir el pago' });
    }

    // 4. Descontar saldo de la wallet
    await pool.query(`
      UPDATE fintech.wallets
      SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP
      WHERE wallet_id = $2
    `, [aPagar, wallet_id]);

    // 5. Registrar pago
    await pool.query(`
      INSERT INTO fintech.credit_payments (credit_id, payment_amount)
      VALUES ($1, $2)
    `, [creditId, aPagar]);

    // 6. Auditar la operación
    await pool.query(`
      INSERT INTO fintech.audit_log (
        accion,
        tabla_afectada,
        registro_id,
        usuario_id,
        detalle
      ) VALUES (
        'pago_credito',
        'credit_payments',
        $1, $2, $3
      )
    `, [
      creditId,
      req.user.userId,
      `Pago de ${aPagar} al crédito ${creditId} desde wallet ${wallet_id}`
    ]);

    await pool.query('COMMIT');
    return res.status(200).json({
      message: `Pago de ${aPagar} registrado con éxito`,
      restante: restante - aPagar
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error(error);
    return res.status(500).json({ error: 'Error al procesar el pago' });
  }
};
