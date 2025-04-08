SELECT
    status,
    COUNT(*) AS total_credits,
    SUM(amount) AS total_amount
FROM fintech.credits
GROUP BY status;
