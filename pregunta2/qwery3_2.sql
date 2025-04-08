WITH credit_summary AS (
    SELECT 
        COUNT(*) FILTER (WHERE status = 'APPROVED' OR status = 'DEFAULT') AS relevant_credits,
        COUNT(*) FILTER (WHERE status = 'DEFAULT') AS default_credits
    FROM fintech.credits
)
SELECT
    relevant_credits,
    default_credits,
    CASE 
        WHEN relevant_credits = 0 THEN 0
        ELSE (default_credits::decimal / relevant_credits::decimal * 100)
    END AS default_percentage
FROM credit_summary;
