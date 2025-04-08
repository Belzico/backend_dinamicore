CREATE OR REPLACE FUNCTION generar_plan_pagos(credito_id INTEGER)
RETURNS VOID AS
$$
DECLARE
    v_amount DECIMAL(10,2);
    v_interest_rate DECIMAL(5,2);
    v_num_cuotas INT := 5;
    v_monto_cuota DECIMAL(10,2);
    i INT;
BEGIN
    -- Obtener datos del crédito
    SELECT amount, interest_rate
      INTO v_amount, v_interest_rate
      FROM fintech.credits
     WHERE credit_id = credito_id;

    -- Validar existencia
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Crédito con ID % no encontrado o inválido', credito_id;
    END IF;

    -- Validar datos completos
    IF v_amount IS NULL OR v_interest_rate IS NULL THEN
        RAISE EXCEPTION 'El crédito ID % tiene datos incompletos (monto o interés nulo)', credito_id;
    END IF;

    -- Calcular monto de la cuota
    v_monto_cuota := (v_amount + (v_amount * (v_interest_rate / 100))) / v_num_cuotas;

    -- Insertar cuotas mensuales
    FOR i IN 1..v_num_cuotas LOOP
        INSERT INTO fintech.credit_payments (
            credit_id,
            payment_amount,
            payment_date
        )
        VALUES (
            credito_id,
            v_monto_cuota,
            CURRENT_DATE + (i * INTERVAL '30 days')
        );
    END LOOP;

    -- Registro en tabla de auditoría
    INSERT INTO fintech.audit_log (
        accion,
        tabla_afectada,
        registro_id,
        usuario_id,
        detalle
    )
    VALUES (
        'generar_pagos',
        'credit_payments',
        credito_id,
        NULL,
        FORMAT(
            'Se generaron %s pagos de %s para el crédito ID %s con interés %s%%',
            v_num_cuotas::TEXT,
            ROUND(v_monto_cuota, 2)::TEXT,
            credito_id::TEXT,
            ROUND(v_interest_rate, 2)::TEXT
        )
    );
END;
$$ LANGUAGE plpgsql;
