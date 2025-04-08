const pool = require('../config/db');

exports.getAuditLog = async (req, res) => {
  try {
    console.log('[AUDIT] Petición recibida de usuario:', req.user);

    const query = `
      SELECT 
        id,
        accion,
        tabla_afectada,
        registro_id,
        usuario_id,
        detalle,
        fecha
      FROM fintech.audit_log
      ORDER BY fecha DESC
      LIMIT 100
    `;

    console.log('[AUDIT] Ejecutando consulta SQL...');
    const { rows } = await pool.query(query);
    console.log('[AUDIT] Registros obtenidos:', rows.length);

    return res.status(200).json({ audit_log: rows });
  } catch (error) {
    console.error('[AUDIT] Error al obtener el log:', error.message);
    return res.status(500).json({ error: 'Error fetching audit log' });
  }
};
