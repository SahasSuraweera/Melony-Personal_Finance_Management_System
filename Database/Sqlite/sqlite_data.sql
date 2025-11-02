PRAGMA foreign_keys = ON;

BEGIN TRANSACTION;

-- ADMININFO (optional for admin references)
INSERT INTO AdminInfo (firstName, lastName, officeEmail, password, role, department, officePhone) VALUES
('Nimali', 'Perera', 'nimali.perera1@melony.lk', 'Admin@123', 'System Admin', 'IT', '0112345678');

-- USERINFO
INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNO, streetName, city) VALUES
('Sahan', 'Fernando', 'sahan.f1@gmail.com', 'Sahan@123', 'Software Engineer', '45/2', 'Temple Road', 'Kandy');

-- USER_PHONE
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES
(1, '0712345678', 'Y'),
(1, '0778765432', 'N');

-- NOTE
INSERT INTO Note (user_id, title, description, actionDate) VALUES
(1, 'Electricity Bill Reminder', 'Pay Ceylon Electricity Board bill before 10th Nov.', '2025-11-05'),
(1, 'Grocery Shopping', 'Buy groceries from Keells and Cargills this weekend.', '2025-11-12');

-- ACCOUNT_TYPE
INSERT INTO Account_Type (accTypeName, assetOrLiability) VALUES
('Savings Account', 'Asset'),
('Credit Card', 'Liability');

-- ACCOUNT
INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive) VALUES
(1, 1, 'Main Savings', NULL, 'BOC', 50000.00, 'Y'),
(1, 2, 'BOC Credit Card', NULL, 'BOC', -15000.00, 'Y');

-- TRANSACTION_CATEGORY
INSERT INTO Transaction_Category (categoryName) VALUES
('Groceries'),
('Utilities'),
('Transport'),
('Dining'),
('Healthcare');

-- TRANSACTION_INFO
INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime) VALUES
(1, 1, 2, 4800.00, 'Expense', 'Electricity bill payment', '2025-11-01', CURRENT_TIMESTAMP),
(1, 1, 1, 9500.00, 'Expense', 'Weekly grocery shopping', '2025-11-03', CURRENT_TIMESTAMP),
(1, 1, 3, 2500.00, 'Expense', 'Fuel for motorbike', '2025-11-04', CURRENT_TIMESTAMP),
(1, 2, 4, 1500.00, 'Expense', 'Dinner with family', '2025-11-05', CURRENT_TIMESTAMP);

-- BUDGET
INSERT INTO Budget (user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description) VALUES
(1, 1, '2025-11-01', '2025-11-30', 10000.00, 20000.00, 'Groceries for November');

-- INTERNAL_TRANSACTION
INSERT INTO Internal_Transaction (user_id, from_account_id, to_account_id, amount, transferType, description, tranDate, tranTime) VALUES
(1, 1, 2, 5000.00, 'Transfer', 'Transfer to credit card', '2025-11-07', CURRENT_TIMESTAMP);

-- SAVING_GOAL
INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive) VALUES
(1, 1, 'Buy Laptop', 150000.00, 20000.00, '2025-11-01', '2026-03-01', 'Y');

-- SAVING_TRANSACTION
INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, tranDate, tranTime) VALUES
(1, 1, 1, 5000.00, 'Monthly contribution', '2025-11-10', CURRENT_TIMESTAMP);

COMMIT;
