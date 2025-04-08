WITH monthly_stats AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        transaction_type,
        SUM(amount) AS total_amount,
        COUNT(*) AS total_count
    FROM fintech.transactions
    GROUP BY 1, 2
    ORDER BY 1, 2
)
SELECT
    month,
    transaction_type,
    total_amount,
    total_count,
    LAG(total_amount, 1, 0) OVER (PARTITION BY transaction_type ORDER BY month) AS previous_month_amount,
    (total_amount 
      - LAG(total_amount, 1, 0) OVER (PARTITION BY transaction_type ORDER BY month)
    ) AS growth_amount,
    ROUND(
      (CASE WHEN LAG(total_amount, 1, 0) OVER (PARTITION BY transaction_type ORDER BY month) = 0 
            THEN 0
            ELSE (total_amount * 100.0 
                  / LAG(total_amount, 1, 0) OVER (PARTITION BY transaction_type ORDER BY month))
        END
      ), 2
    ) AS growth_percentage
FROM monthly_stats
ORDER BY month, transaction_type;
