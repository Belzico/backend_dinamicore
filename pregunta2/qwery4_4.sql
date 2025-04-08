WITH payments_summary AS (
    SELECT 
        c.user_id,
        c.credit_id,
        c.amount AS credit_amount,
        SUM(cp.payment_amount) AS sum_payments
    FROM fintech.credits c
    LEFT JOIN fintech.credit_payments cp ON c.credit_id = cp.credit_id
    WHERE c.status = 'APPROVED'
    GROUP BY c.user_id, c.credit_id, c.amount
)
SELECT COUNT(DISTINCT user_id) AS users_with_fully_paid_credits
FROM payments_summary
WHERE sum_payments >= credit_amount;
