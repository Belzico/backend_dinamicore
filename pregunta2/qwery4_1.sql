SELECT 
    u.user_id,
    u.first_name || ' ' || u.last_name AS full_name,
    c.credit_id,
    c.status,
    COUNT(cp.payment_id) AS total_payments,
    COALESCE(SUM(cp.payment_amount), 0) AS total_paid
FROM fintech.users u
JOIN fintech.credits c ON u.user_id = c.user_id
LEFT JOIN fintech.credit_payments cp ON c.credit_id = cp.credit_id
WHERE c.status = 'APPROVED'
GROUP BY u.user_id, full_name, c.credit_id, c.status
ORDER BY total_paid DESC;
