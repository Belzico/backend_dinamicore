DROP TRIGGER IF EXISTS trig_check_funds ON fintech.transactions;

CREATE TRIGGER trig_check_funds
BEFORE INSERT
ON fintech.transactions
FOR EACH ROW
EXECUTE FUNCTION verificar_fondos_suficientes();
