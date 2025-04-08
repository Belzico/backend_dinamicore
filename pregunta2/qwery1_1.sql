SELECT 
    u.user_id,
    u.first_name || ' ' || u.last_name AS full_name,
    w.wallet_id,
    w.balance,
    w.currency
FROM fintech.users u
JOIN fintech.wallets w ON u.user_id = w.user_id
ORDER BY u.user_id, w.wallet_id;
