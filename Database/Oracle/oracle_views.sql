CREATE OR REPLACE VIEW vw_user_accounts_summary AS
SELECT 
    u.user_id,
    u.firstName || ' ' || u.lastName AS full_name,
    SUM(CASE WHEN at.assetOrLiability = 'Asset' THEN a.balance ELSE 0 END) AS total_assets,
    SUM(CASE WHEN at.assetOrLiability = 'Liability' THEN a.balance ELSE 0 END) AS total_liabilities,
    (SUM(CASE WHEN at.assetOrLiability = 'Asset' THEN a.balance ELSE 0 END) +
     SUM(CASE WHEN at.assetOrLiability = 'Liability' THEN a.balance ELSE 0 END)) AS net_worth
        FROM Account a
        JOIN Account_Type at ON a.acc_type_id = at.acc_type_id
        JOIN UserInfo u ON a.user_id = u.user_id
        WHERE a.isActive = 'Y'
        GROUP BY u.user_id, u.firstName, u.lastName;

select * from vw_user_accounts_summary;

CREATE OR REPLACE VIEW vw_latest_income_vs_expense AS
SELECT 
    t.user_id,
    TO_CHAR(SYSDATE, 'YYYY-MM') AS month,
    SUM(CASE WHEN t.transactionType = 'Income' THEN t.amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN t.transactionType = 'Expense' THEN t.amount ELSE 0 END) AS total_expense,
    (SUM(CASE WHEN t.transactionType = 'Income' THEN t.amount ELSE 0 END) -
     SUM(CASE WHEN t.transactionType = 'Expense' THEN t.amount ELSE 0 END)) AS net_saving
FROM Transaction_Info t
WHERE t.isDeleted = 'N'
  AND t.tranDate >= TRUNC(SYSDATE, 'MM')
  AND t.tranDate < ADD_MONTHS(TRUNC(SYSDATE, 'MM'), 1)
GROUP BY t.user_id
ORDER BY t.user_id;

select * from vw_income_vs_expense_summary;


CREATE OR REPLACE VIEW vw_overall_saving_progress AS
SELECT
    g.user_id,
    COUNT(*) AS total_goals,
    SUM(g.targetAmount) AS total_target_amount,
    SUM(NVL(a.balance, 0)) AS total_current_amount,  -- ✅ live balance from linked account
    ROUND(
        (SUM(NVL(a.balance, 0)) / NULLIF(SUM(g.targetAmount), 0)) * 100,
        2
    ) AS overall_progress_percent,
    SUM(CASE WHEN NVL(a.balance, 0) >= g.targetAmount THEN 1 ELSE 0 END) AS completed_goals,
    SUM(CASE WHEN g.isActive = 'Y' THEN 1 ELSE 0 END) AS active_goals,
    CASE 
        WHEN ROUND(
            (SUM(NVL(a.balance, 0)) / NULLIF(SUM(g.targetAmount), 0)) * 100,
            2
        ) >= 100 THEN 'Achieved All'
        WHEN ROUND(
            (SUM(NVL(a.balance, 0)) / NULLIF(SUM(g.targetAmount), 0)) * 100,
            2
        ) >= 75 THEN 'On Track'
        WHEN ROUND(
            (SUM(NVL(a.balance, 0)) / NULLIF(SUM(g.targetAmount), 0)) * 100,
            2
        ) >= 40 THEN 'Moderate Progress'
        ELSE 'Needs Attention'
    END AS goal_summary_status
FROM Saving_Goal g
LEFT JOIN Account a
    ON g.account_id = a.account_id
WHERE g.isActive = 'Y'
GROUP BY g.user_id
ORDER BY g.user_id;
/

select * from vw_overall_saving_progress;

CREATE OR REPLACE VIEW vw_overall_budget_progress AS
SELECT 
    sub.user_id,
    SUM(sub.maximumLimit) AS total_allocated,
    NVL(SUM(sub.total_spent), 0) AS total_spent,
    (SUM(sub.maximumLimit) - NVL(SUM(sub.total_spent), 0)) AS total_remaining,
    ROUND((NVL(SUM(sub.total_spent), 0) / NULLIF(SUM(sub.maximumLimit), 0)) * 100, 2) AS overall_usage_percent,
    CASE
        WHEN (NVL(SUM(sub.total_spent), 0) / NULLIF(SUM(sub.maximumLimit), 0)) * 100 >= 100 THEN 'Exceeded'
        WHEN (NVL(SUM(sub.total_spent), 0) / NULLIF(SUM(sub.maximumLimit), 0)) * 100 >= 75 THEN 'Warning'
        ELSE 'Safe'
    END AS overall_status
FROM (
    SELECT 
        b.user_id,
        b.budget_id,
        b.maximumLimit,
        SUM(NVL(t.amount, 0)) AS total_spent
    FROM Budget b
    LEFT JOIN Transaction_Info t
        ON t.user_id = b.user_id
        AND t.category_id = b.category_id
        AND t.transactionType = 'Expense'
        AND t.isDeleted = 'N'
        AND t.tranDate BETWEEN b.startDate AND b.endDate
    GROUP BY b.user_id, b.budget_id, b.maximumLimit
) sub
GROUP BY sub.user_id;

select * from vw_overall_budget_progress;






