-- === Más usuarios ===
INSERT INTO fintech.users (first_name, last_name, email, hashed_password, credit_score, credit_limit)
VALUES
('Diana', 'Duran', 'diana@example.com', 'hashedpass321', 620, 2000),
('Eli', 'Esteban', 'eli@example.com', 'hashedpass654', 780, 8000);

-- === Más wallets ===
INSERT INTO fintech.wallets (user_id, balance, currency)
VALUES
(4, 300.00, 'USD'),   -- Diana
(5, 900.00, 'USD');   -- Eli

-- === Más transacciones para ver tendencias mensuales ===
INSERT INTO fintech.transactions (wallet_id, amount, transaction_type, created_at)
VALUES
-- Agosto
(4, 150.00, 'deposit', '2023-08-12'),
(4, 100.00, 'withdraw', '2023-08-15'),
-- Septiembre
(1, 400.00, 'deposit', '2023-09-01'),
(2, 100.00, 'deposit', '2023-09-02'),
(4, 200.00, 'deposit', '2023-09-10'),
(4, 50.00, 'withdraw', '2023-09-12'),
(5, 100.00, 'deposit', '2023-09-14'),
-- Octubre
(1, 300.00, 'deposit', '2023-10-01'),
(2, 150.00, 'deposit', '2023-10-02'),
(4, 100.00, 'withdraw', '2023-10-05'),
(5, 200.00, 'deposit', '2023-10-06');

-- Transferencias entre wallets
INSERT INTO fintech.transactions (wallet_id, wallet_id_dest, amount, transaction_type, created_at)
VALUES
(2, 4, 50.00, 'transfer', '2023-09-15'),
(3, 5, 300.00, 'transfer', '2023-10-10');

-- === Más créditos ===
INSERT INTO fintech.credits (user_id, amount, interest_rate, status, applied_at, approved_at)
VALUES
(4, 1000.00, 7.0, 'APPROVED', '2023-07-10', '2023-07-12'), -- Diana
(5, 2000.00, 6.5, 'APPROVED', '2023-08-01', '2023-08-05'), -- Eli
(2, 800.00, 5.0, 'DEFAULT', '2023-06-01', '2023-06-05');   -- Bob (nuevo crédito en mora)

-- === Más pagos de crédito ===
INSERT INTO fintech.credit_payments (credit_id, payment_amount, payment_date)
VALUES
-- Diana (pagó poco)
(4, 100.00, '2023-07-20'),
(4, 100.00, '2023-08-20'),
-- Eli (pagó todo)
(5, 1000.00, '2023-08-15'),
(5, 1000.00, '2023-09-15');
-- Bob (no pagó nada del crédito en DEFAULT)

-- === Casos con pagos mayores al monto para probar comportamiento bueno ===
INSERT INTO fintech.credits (user_id, amount, interest_rate, status, applied_at, approved_at)
VALUES
(1, 500.00, 4.0, 'APPROVED', '2023-07-20', '2023-07-22'); -- Alice segundo crédito

INSERT INTO fintech.credit_payments (credit_id, payment_amount, payment_date)
VALUES
(6, 250.00, '2023-07-25'),
(6, 250.00, '2023-08-01');
