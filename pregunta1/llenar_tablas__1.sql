-- 1. Insertar usuarios
INSERT INTO fintech.users (first_name, last_name, email, hashed_password, credit_score, credit_limit)
VALUES
('Alice', 'Anderson', 'alice@example.com', 'hashedpass123', 700, 5000),
('Bob', 'Brown', 'bob@example.com', 'hashedpass456', 650, 3000),
('Charlie', 'Clark', 'charlie@example.com', 'hashedpass789', 800, 10000);

-- 2. Insertar wallets
INSERT INTO fintech.wallets (user_id, balance, currency)
VALUES
(1, 1000.00, 'USD'),  -- Alice
(1, 500.00, 'USD'),   -- Alice (segunda wallet)
(2, 200.00, 'USD'),   -- Bob
(3, 1500.00, 'USD');  -- Charlie

-- 3. Insertar transacciones (depositos, retiros, transferencias)
-- Nota: Para transferencias, especifica wallet_id y wallet_id_dest.
INSERT INTO fintech.transactions (wallet_id, amount, transaction_type, created_at)
VALUES
(1, 200.00, 'deposit', '2023-08-01'),
(1, 100.00, 'withdraw', '2023-08-05'),
(2, 50.00, 'deposit', '2023-08-10'),
(3, 500.00, 'deposit', '2023-08-11');

-- Ejemplo de transferencia (wallet 1 -> wallet 2)
INSERT INTO fintech.transactions (wallet_id, wallet_id_dest, amount, transaction_type, created_at)
VALUES
(1, 2, 100.00, 'transfer', '2023-09-01');

-- 4. Insertar créditos
INSERT INTO fintech.credits (user_id, amount, interest_rate, status, applied_at, approved_at)
VALUES
(1, 2000.00, 5.50, 'APPROVED', '2023-07-01', '2023-07-05'), -- Alice
(2, 1500.00, 6.00, 'PENDING', '2023-07-15', NULL),          -- Bob
(3, 10000.00, 4.20, 'APPROVED', '2023-06-01', '2023-06-03');-- Charlie

-- 5. Insertar pagos de crédito
INSERT INTO fintech.credit_payments (credit_id, payment_amount, payment_date)
VALUES
(1, 200.00, '2023-07-15'),  -- Pago 1 de Alice
(1, 200.00, '2023-07-30'),  -- Pago 2 de Alice
(3, 1000.00, '2023-06-15'); -- Pago 1 de Charlie
