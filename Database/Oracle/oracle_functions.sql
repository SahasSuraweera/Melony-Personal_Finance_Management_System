CREATE OR REPLACE FUNCTION fn_monthly_expenditure_analysis (
    p_user_id IN NUMBER,
    p_year    IN NUMBER
) RETURN SYS_REFCURSOR
AS
    rc SYS_REFCURSOR;
BEGIN
    OPEN rc FOR
        WITH monthly_expense AS (
            SELECT
                TO_CHAR(tranDate, 'YYYY-MM') AS month_label,
                SUM(amount) AS total_expense
            FROM Transaction_Info
            WHERE user_id = p_user_id
              AND transactionType = 'Expense'
              AND EXTRACT(YEAR FROM tranDate) = p_year
            GROUP BY TO_CHAR(tranDate, 'YYYY-MM')
        ),

        expense_with_change AS (
            SELECT
                month_label,
                total_expense,
                LAG(total_expense) OVER (ORDER BY month_label) AS prev_expense,
                ROUND(
                    CASE
                        WHEN LAG(total_expense) OVER (ORDER BY month_label) = 0 THEN NULL
                        ELSE ((total_expense - LAG(total_expense) OVER (ORDER BY month_label)) /
                              LAG(total_expense) OVER (ORDER BY month_label)) * 100
                    END, 2
                ) AS change_percentage
            FROM monthly_expense
        ),
        category_totals AS (
            SELECT
                TO_CHAR(t.tranDate, 'YYYY-MM') AS month_label,
                c.categoryName,
                SUM(t.amount) AS total_by_category
            FROM Transaction_Info t
            JOIN Transaction_Category c ON t.category_id = c.category_id
            WHERE t.user_id = p_user_id
              AND t.transactionType = 'Expense'
              AND EXTRACT(YEAR FROM t.tranDate) = p_year
            GROUP BY TO_CHAR(t.tranDate, 'YYYY-MM'), c.categoryName
        ),
        top_categories AS (
            SELECT 
                month_label,
                LISTAGG(categoryName || ' (' || total_by_category || ')', ', ')
                    WITHIN GROUP (ORDER BY total_by_category DESC) AS top_3_categories
            FROM (
                SELECT 
                    month_label, categoryName, total_by_category,
                    ROW_NUMBER() OVER (PARTITION BY month_label ORDER BY total_by_category DESC) AS rn
                FROM category_totals
            )
            WHERE rn <= 3
            GROUP BY month_label
        )
        SELECT 
            e.month_label,
            NVL(e.total_expense, 0) AS total_expense,
            NVL(e.prev_expense, 0) AS prev_expense,
            NVL(e.change_percentage, 0) AS change_percentage,
            NVL(tc.top_3_categories, 'No Data') AS top_3_categories
        FROM expense_with_change e
        LEFT JOIN top_categories tc ON e.month_label = tc.month_label
        ORDER BY e.month_label;

    RETURN rc;
END;
/


VAR rc REFCURSOR;
EXEC :rc := fn_monthly_expenditure_analysis(1, 2025);
PRINT rc;


CREATE OR REPLACE FUNCTION fn_budget_adherence_monthly (
    p_user_id IN NUMBER,
    p_year IN NUMBER,
    p_month IN NUMBER
) RETURN SYS_REFCURSOR
AS
    rc SYS_REFCURSOR;
BEGIN
    OPEN rc FOR
        SELECT 
            c.categoryName AS category,
            b.maximumLimit AS budget_limit,
            NVL(SUM(t.amount), 0) AS actual_spent,

            CASE 
                WHEN b.maximumLimit > 0 THEN 
                    ROUND((NVL(SUM(t.amount), 0) / b.maximumLimit) * 100, 2)
                ELSE 
                    0
            END AS used_percentage,

            (b.maximumLimit - NVL(SUM(t.amount), 0)) AS remaining_amount,

            CASE 
                WHEN NVL(SUM(t.amount), 0) > b.maximumLimit THEN 'Exceeded Budget'
                WHEN NVL(SUM(t.amount), 0) >= (b.maximumLimit * 0.8) THEN 'Near Limit'
                ELSE 'Within Budget'
            END AS status

        FROM Budget b
        JOIN Transaction_Category c 
            ON b.category_id = c.category_id
        LEFT JOIN Transaction_Info t 
            ON t.category_id = b.category_id
           AND t.user_id = b.user_id
           AND t.transactionType = 'Expense'
           AND EXTRACT(YEAR FROM t.tranDate) = p_year
           AND EXTRACT(MONTH FROM t.tranDate) = p_month
        WHERE b.user_id = p_user_id
          AND EXTRACT(YEAR FROM b.startDate) <= p_year
          AND EXTRACT(MONTH FROM b.startDate) <= p_month
          AND EXTRACT(YEAR FROM b.endDate) >= p_year
          AND EXTRACT(MONTH FROM b.endDate) >= p_month
        GROUP BY c.categoryName, b.maximumLimit
        ORDER BY c.categoryName;

    RETURN rc;
END;
/


VAR rc REFCURSOR;
EXEC :rc := fn_budget_adherence_monthly(1, 2025, 11);
PRINT rc;


CREATE OR REPLACE FUNCTION fn_saving_goal_progress (
    p_user_id IN NUMBER
) RETURN SYS_REFCURSOR
AS
    rc SYS_REFCURSOR;
BEGIN
    OPEN rc FOR
        SELECT 
            sg.goalName AS goal_name,
            sg.targetAmount AS target_amount,
            sg.currentAmount AS current_amount,
            ROUND((sg.currentAmount / sg.targetAmount) * 100, 2) AS progress_percentage,
            CASE 
                WHEN sg.currentAmount >= sg.targetAmount THEN 'Completed'
                WHEN sg.currentAmount >= sg.targetAmount * 0.8 THEN 'Near Goal'
                ELSE 'In Progress'
            END AS status,
            sg.startDate AS start_date,
            sg.endDate AS end_date
        FROM Saving_Goal sg
        WHERE sg.user_id = p_user_id
          AND sg.isActive = 'Y';

    RETURN rc;
END;
/

VAR rc REFCURSOR;
EXEC :rc := fn_saving_goal_progress(1);
PRINT rc;


CREATE OR REPLACE FUNCTION fn_category_expense_monthly (
    p_user_id IN NUMBER,
    p_year    IN NUMBER,
    p_month   IN NUMBER
) RETURN SYS_REFCURSOR
AS
    rc SYS_REFCURSOR;
BEGIN
    OPEN rc FOR
        SELECT 
            tc.categoryName AS category,
            NVL(SUM(ti.amount), 0) AS total_spent,
            ROUND(
                (NVL(SUM(ti.amount), 0) /
                (SELECT NVL(SUM(amount), 1)
                 FROM Transaction_Info
                 WHERE user_id = p_user_id
                 AND transactionType = 'Expense'
                 AND EXTRACT(YEAR FROM tranDate) = p_year
                 AND EXTRACT(MONTH FROM tranDate) = p_month)
                ) * 100, 2
            ) AS percentage
        FROM Transaction_Info ti
        JOIN Transaction_Category tc ON ti.category_id = tc.category_id
        WHERE ti.user_id = p_user_id
          AND ti.transactionType = 'Expense'
          AND EXTRACT(YEAR FROM ti.tranDate) = p_year
          AND EXTRACT(MONTH FROM ti.tranDate) = p_month
        GROUP BY tc.categoryName
        ORDER BY total_spent DESC;

    RETURN rc;
END;
/

VAR rc REFCURSOR;
EXEC :rc := fn_category_expense_monthly(1, 2025, 11);
PRINT rc;

CREATE OR REPLACE FUNCTION fn_forecasted_savings_trends (
    p_user_id IN NUMBER
) RETURN SYS_REFCURSOR
AS
    rc SYS_REFCURSOR;
BEGIN
    OPEN rc FOR
        WITH monthly_summary AS (
            SELECT
                TO_CHAR(tranDate, 'YYYY-MM') AS month_label,
                SUM(CASE WHEN transactionType = 'Income' THEN amount ELSE 0 END) AS total_income,
                SUM(CASE WHEN transactionType = 'Expense' THEN amount ELSE 0 END) AS total_expense,
                (SUM(CASE WHEN transactionType = 'Income' THEN amount ELSE 0 END)
                - SUM(CASE WHEN transactionType = 'Expense' THEN amount ELSE 0 END)) AS net_savings
            FROM Transaction_Info
            WHERE user_id = p_user_id
            GROUP BY TO_CHAR(tranDate, 'YYYY-MM')
        ),

        last_actual_month AS (
            SELECT MAX(TO_DATE(month_label, 'YYYY-MM')) AS last_month
            FROM monthly_summary
        ),

        last_3_months AS (
            SELECT month_label, net_savings,
                   ROW_NUMBER() OVER (ORDER BY TO_DATE(month_label, 'YYYY-MM') DESC) AS rn
            FROM monthly_summary
            WHERE TO_DATE(month_label, 'YYYY-MM') <= (SELECT last_month FROM last_actual_month)
        ),

        -- Forecast Month 1
        f1 AS (
            SELECT 
                TO_CHAR(ADD_MONTHS((SELECT last_month FROM last_actual_month), 1), 'YYYY-MM') AS month_label,
                (SELECT ROUND(AVG(net_savings), 2) FROM last_3_months WHERE rn <= 3) AS forecasted_savings
            FROM dual
        ),

        -- Forecast Month 2
        f2 AS (
            SELECT 
                TO_CHAR(ADD_MONTHS((SELECT last_month FROM last_actual_month), 2), 'YYYY-MM') AS month_label,
                (SELECT ROUND(AVG(value), 2)
                 FROM (
                     SELECT net_savings AS value FROM last_3_months WHERE rn <= 2
                     UNION ALL
                     SELECT forecasted_savings AS value FROM f1
                 )) AS forecasted_savings
            FROM dual
        ),

        -- Forecast Month 3
        f3 AS (
            SELECT 
                TO_CHAR(ADD_MONTHS((SELECT last_month FROM last_actual_month), 3), 'YYYY-MM') AS month_label,
                (SELECT ROUND(AVG(value), 2)
                 FROM (
                     SELECT net_savings AS value FROM last_3_months WHERE rn = 1
                     UNION ALL
                     SELECT forecasted_savings AS value FROM f1
                     UNION ALL
                     SELECT forecasted_savings AS value FROM f2
                 )) AS forecasted_savings
            FROM dual
        ),

        all_forecasts AS (
            SELECT * FROM f1
            UNION ALL SELECT * FROM f2
            UNION ALL SELECT * FROM f3
        )

        SELECT 
            m.month_label,
            NVL(m.total_income, 0) AS total_income,
            NVL(m.total_expense, 0) AS total_expense,
            NVL(m.net_savings, 0) AS actual_savings,
            NULL AS forecasted_savings
        FROM monthly_summary m
        WHERE TO_DATE(m.month_label, 'YYYY-MM') <= (SELECT last_month FROM last_actual_month)

        UNION ALL

        SELECT 
            f.month_label,
            NULL AS total_income,
            NULL AS total_expense,
            NULL AS actual_savings,
            f.forecasted_savings
        FROM all_forecasts f

        ORDER BY month_label;

    RETURN rc;
END;
/