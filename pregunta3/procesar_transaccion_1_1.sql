CREATE OR REPLACE FUNCTION procesar_transaccion(
    wallet_origen INTEGER,
    wallet_destino INTEGER,
    monto DECIMAL(10,2),
    tipo VARCHAR
)
RETURNS BOOLEAN AS
$$
DECLARE
    saldo_origen DECIMAL(10,2);
    saldo_destino DECIMAL(10,2);
    transaccion_id INTEGER;
BEGIN
    SELECT balance
      INTO saldo_origen
      FROM fintech.wallets
     WHERE wallet_id = wallet_origen
     FOR UPDATE;

    IF tipo IN ('withdraw', 'transfer') THEN
        IF saldo_origen < monto THEN
            RAISE EXCEPTION 'Fondos insuficientes en la wallet de origen (ID: %)', wallet_origen;
        END IF;

        UPDATE fintech.wallets
           SET balance = balance - monto,
               updated_at = CURRENT_TIMESTAMP
         WHERE wallet_id = wallet_origen;
    END IF;

    IF tipo = 'deposit' THEN
        UPDATE fintech.wallets
           SET balance = balance + monto,
               updated_at = CURRENT_TIMESTAMP
         WHERE wallet_id = wallet_origen;
    ELSIF tipo = 'transfer' THEN
        IF wallet_destino IS NULL THEN
            RAISE EXCEPTION 'wallet_destino no puede ser NULL en una transferencia';
        END IF;

        SELECT balance
          INTO saldo_destino
          FROM fintech.wallets
         WHERE wallet_id = wallet_destino
         FOR UPDATE;

        UPDATE fintech.wallets
           SET balance = balance + monto,
               updated_at = CURRENT_TIMESTAMP
         WHERE wallet_id = wallet_destino;
    END IF;

    -- Registrar transacción
    INSERT INTO fintech.transactions (
        wallet_id,
        wallet_id_dest,
        amount,
        transaction_type,
        created_at
    )
    VALUES (
        wallet_origen,
        wallet_destino,
        monto,
        tipo,
        CURRENT_TIMESTAMP
    )
    RETURNING transaction_id INTO transaccion_id;

    -- Registrar auditoría
    INSERT INTO fintech.audit_log (
        accion,
        tabla_afectada,
        registro_id,
        usuario_id,
        detalle
    )
    VALUES (
        'procesar_transaccion',
        'transactions',
        transaccion_id,
        NULL,
        FORMAT(
            'Transacción tipo %s por %s desde wallet %s %s',
            tipo,
            ROUND(monto, 2)::TEXT,
            wallet_origen,
            CASE
              WHEN tipo = 'transfer' THEN FORMAT('a wallet %s', wallet_destino)
              ELSE ''
            END
        )
    );

    RETURN TRUE;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
