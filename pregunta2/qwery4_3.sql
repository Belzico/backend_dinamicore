SELECT COUNT(DISTINCT user_id) AS users_with_approved_credits
FROM fintech.credits
WHERE status = 'APPROVED';
