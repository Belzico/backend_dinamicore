SELECT 
    u.user_id,
    u.first_name || ' ' || u.last_name AS full_name,
    SUM(w.balance) AS total_balance
FROM fintech.users u
JOIN fintech.wallets w ON u.user_id = w.user_id
GROUP BY u.user_id, full_name
ORDER BY total_balance DESC;
