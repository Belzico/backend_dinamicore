WITH payments_summary AS (
    SELECT 
        c.credit_id,
        c.amount AS credit_amount,
        SUM(cp.payment_amount) AS sum_payments
    FROM fintech.credits c
    LEFT JOIN fintech.credit_payments cp ON c.credit_id = cp.credit_id
    GROUP BY c.credit_id
)
SELECT 
    u.user_id,
    u.first_name || ' ' || u.last_name AS full_name,
    c.credit_id,
    c.status,
    ps.sum_payments,
    ps.credit_amount
FROM fintech.users u
JOIN fintech.credits c ON u.user_id = c.user_id
JOIN payments_summary ps ON c.credit_id = ps.credit_id
WHERE c.status = 'APPROVED'
  AND ps.sum_payments >= ps.credit_amount  -- fully paid
ORDER BY ps.sum_payments DESC;
