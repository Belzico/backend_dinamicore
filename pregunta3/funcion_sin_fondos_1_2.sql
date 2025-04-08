CREATE OR REPLACE FUNCTION verificar_fondos_suficientes()
RETURNS TRIGGER AS
$$
DECLARE
    saldo_actual DECIMAL(10,2);
BEGIN
    -- Solo aplica si es un retiro o transferencia
    IF NEW.transaction_type IN ('withdraw', 'transfer') THEN
        SELECT balance
          INTO saldo_actual
          FROM fintech.wallets
         WHERE wallet_id = NEW.wallet_id;

        IF saldo_actual < NEW.amount THEN
            RAISE EXCEPTION 'Fondos insuficientes para % en wallet ID %', NEW.transaction_type, NEW.wallet_id;
        END IF;
    END IF;

    RETURN NEW;  -- Permite la inserción/actualización si todo está OK
END;
$$ LANGUAGE plpgsql;
