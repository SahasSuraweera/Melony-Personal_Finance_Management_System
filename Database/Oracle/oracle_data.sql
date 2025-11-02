
-- ADMININFO
INSERT INTO AdminInfo (firstName, lastName, officeEmail, password, role, department, officePhone) VALUES
('Nimali', 'Perera', 'nimali.perera1@melony.lk', 'Admin@123', 'System Admin', 'IT', '0112345678');
INSERT INTO AdminInfo (firstName, lastName, officeEmail, password, role, department, officePhone) VALUES
('Ravindu', 'Silva', 'ravindu.silva1@melony.lk', 'Ravi@2025', 'Finance Manager', 'Finance', '0112987456');
INSERT INTO AdminInfo (firstName, lastName, officeEmail, password, role, department, officePhone) VALUES
('Harsha', 'Fernando', 'harsha.fernando1@melony.lk', 'Harsha@789', 'Support Lead', 'Support', '0114789632');
INSERT INTO AdminInfo (firstName, lastName, officeEmail, password, role, department, officePhone) VALUES
('Dilini', 'Jayawardena', 'dilini.j1@melony.lk', 'dilini@123','Operations Officer', 'Operations', '0113322458');
INSERT INTO AdminInfo (firstName, lastName, officeEmail, password, role, department, officePhone) VALUES
('Kasun', 'Ranasinghe', 'kasun.r1@melony.lk','kasun@999', 'Data Analyst', 'Data', '0114455789');

-- USERINFO
INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNO, streetName, city) VALUES
('Sahan', 'Fernando', 'sahan.f1@gmail.com', 'Sahan@123', 'Software Engineer', '45/2', 'Temple Road', 'Kandy');
INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNO, streetName, city) VALUES
('Kavindi', 'Jayasinghe', 'kavindi.j1@gmail.com', 'Kavi@456', 'Teacher', '12A', 'Station Road', 'Galle');
INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNO, streetName, city) VALUES
('Tharindu', 'Wijesekara', 'tharindu.w1@gmail.com', 'Tharu@789', 'Bank Officer', '77', 'Main Street', 'Colombo');
INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNO, streetName, city) VALUES
('Ishara', 'Perera', 'ishara.p1@gmail.com', 'Isha@321', 'Accountant', '23/7', 'Hill Street', 'Kurunegala');
INSERT INTO UserInfo (firstName, lastName, email, password, occupation, houseNO, streetName, city) VALUES
('Dinuka', 'De Silva', 'dinuka.s1@gmail.com', 'Dinu@654', 'Marketing Executive', '88', 'Park Avenue', 'Matara');

-- USER_PHONE
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES (1, '0712345678', 'Y');
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES (1, '0778765432', 'N');
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES (2, '0709876543', 'Y');
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES (3, '0723344556', 'Y');
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES (4, '0752233445', 'Y');
INSERT INTO User_Phone (user_id, phone, isPrimary) VALUES (5, '0778956325', 'Y');

-- NOTE
INSERT INTO Note (user_id, title, description, actionDate) VALUES
(1, 'Electricity Bill Reminder', 'Pay Ceylon Electricity Board bill before 10th Nov.', TO_DATE('2025-11-05','YYYY-MM-DD'));
INSERT INTO Note (user_id, title, description, actionDate) VALUES
(2, 'Grocery Shopping', 'Buy groceries from Keells and Cargills this weekend.', TO_DATE('2025-11-12','YYYY-MM-DD'));
INSERT INTO Note (user_id, title, description, actionDate) VALUES
(3, 'Car Maintenance', 'Take car for service at Toyota Lanka, Peliyagoda on 15th Nov.', TO_DATE('2025-11-15','YYYY-MM-DD'));
INSERT INTO Note (user_id, title, description, actionDate) VALUES
(4, 'Tax Documents', 'Prepare documents for annual income tax submission.', TO_DATE('2025-11-20','YYYY-MM-DD'));
INSERT INTO Note (user_id, title, description, actionDate) VALUES
(5, 'Insurance Renewal', 'Renew health insurance policy before 20th Nov.', TO_DATE('2025-11-19','YYYY-MM-DD'));

-- ACCOUNT_TYPE
INSERT INTO Account_Type (accTypeName, assetOrLiability) VALUES ('Savings Account', 'Asset');
INSERT INTO Account_Type (accTypeName, assetOrLiability) VALUES ('Checking Account', 'Asset');
INSERT INTO Account_Type (accTypeName, assetOrLiability) VALUES ('Current Account', 'Asset');
INSERT INTO Account_Type (accTypeName, assetOrLiability) VALUES ('Credit Card', 'Liability');
INSERT INTO Account_Type (accTypeName, assetOrLiability) VALUES ('Personal Loan', 'Liability');

-- ACCOUNT
INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive) VALUES
(1, 1, 'Main Account', NULL, NULL, 0, 'Y');
INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive) VALUES
(1, 1, 'Daily Account', NULL, NULL, 0, 'Y');
INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive) VALUES
(2, 1, 'Primary Account', NULL, NULL, 0, 'Y');
INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive) VALUES
(3, 1, 'Salary Account', NULL, NULL, 0, 'Y');
INSERT INTO Account (user_id, acc_type_id, nickname, reference, institution, balance, isActive) VALUES
(4, 4, 'Credit Card', NULL, NULL, 0, 'Y');

-- TRANSACTION_CATEGORY
INSERT INTO Transaction_Category (categoryName) VALUES ('Groceries');
INSERT INTO Transaction_Category (categoryName) VALUES ('Transport');
INSERT INTO Transaction_Category (categoryName) VALUES ('Utilities');
INSERT INTO Transaction_Category (categoryName) VALUES ('Dining');
INSERT INTO Transaction_Category (categoryName) VALUES ('Entertainment');
INSERT INTO Transaction_Category (categoryName) VALUES ('Healthcare');

-- TRANSACTION_INFO
INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime) VALUES
(1, 1, 3, 5000.00, 'Expense', 'Electricity bill payment', TO_DATE('2025-11-01','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime) VALUES
(2, 2, 1, 15000.00, 'Expense', 'Grocery shopping', TO_DATE('2025-11-02','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime) VALUES
(3, 3, 2, 2000.00, 'Expense', 'Fuel for car', TO_DATE('2025-11-03','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime) VALUES
(4, 4, 4, 1200.00, 'Expense', 'Dinner at restaurant', TO_DATE('2025-11-04','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Transaction_Info (user_id, account_id, category_id, amount, transactionType, description, tranDate, tranTime) VALUES
(5, 5, 5, 8000.00, 'Expense', 'Movie and entertainment', TO_DATE('2025-11-05','YYYY-MM-DD'), SYSTIMESTAMP);

-- BUDGET
INSERT INTO Budget (user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description)
VALUES (1, 1, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2025-11-30','YYYY-MM-DD'), 10000.00, 20000.00, 'Groceries for November');
INSERT INTO Budget (user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description)
VALUES (2, 3, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2025-11-30','YYYY-MM-DD'), 5000.00, 10000.00, 'Utility bills');
INSERT INTO Budget (user_id, category_id, startDate, endDate, warningLimit, maximumLimit, description)
VALUES (3, 3, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2025-11-30','YYYY-MM-DD'), 4000.00, 8000.00, 'Transport budget');

-- INTERNAL_TRANSACTION
INSERT INTO Internal_Transaction (user_id, from_account_id, to_account_id, amount, transferType, description, tranDate, tranTime) VALUES
(1, 1, 2, 5000.00, 'Transfer', 'Transfer to daily expenses', TO_DATE('2025-11-01','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Internal_Transaction (user_id, from_account_id, to_account_id, amount, transferType, description, tranDate, tranTime) VALUES
(2, 2, 3, 2000.00, 'Transfer', 'Send to salary account', TO_DATE('2025-11-02','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Internal_Transaction (user_id, from_account_id, to_account_id, amount, transferType, description, tranDate, tranTime) VALUES
(3, 3, 4, 1500.00, 'Transfer', 'Emergency fund contribution', TO_DATE('2025-11-03','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Internal_Transaction (user_id, from_account_id, to_account_id, amount, transferType, description, tranDate, tranTime) VALUES
(4, 4, 5, 800.00, 'Transfer', 'Credit card repayment', TO_DATE('2025-11-04','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Internal_Transaction (user_id, from_account_id, to_account_id, amount, transferType, description, tranDate, tranTime) VALUES
(5, 5, 1, 3000.00, 'Transfer', 'Refund to main account', TO_DATE('2025-11-05','YYYY-MM-DD'), SYSTIMESTAMP);

-- SAVING_GOAL
INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive) VALUES
(1, 1, 'Buy Laptop', 150000.00, 20000.00, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2026-03-01','YYYY-MM-DD'), 'Y');
INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive) VALUES
(2, 2, 'Holiday Trip', 300000.00, 50000.00, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2026-06-01','YYYY-MM-DD'), 'Y');
INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive) VALUES
(3, 3, 'Car Downpayment', 1000000.00, 250000.00, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2027-01-01','YYYY-MM-DD'), 'Y');
INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive) VALUES
(4, 4, 'Emergency Fund', 500000.00, 100000.00, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2026-12-31','YYYY-MM-DD'), 'Y');
INSERT INTO Saving_Goal (user_id, account_id, goalName, targetAmount, currentAmount, startDate, endDate, isActive) VALUES
(5, 5, 'New Phone', 150000.00, 50000.00, TO_DATE('2025-11-01','YYYY-MM-DD'), TO_DATE('2026-02-28','YYYY-MM-DD'), 'Y');

-- SAVING_TRANSACTION
INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, tranDate, tranTime) VALUES
(1, 1, 1, 5000.00, 'Monthly contribution', TO_DATE('2025-11-01','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, tranDate, tranTime) VALUES
(2, 2, 2, 10000.00, 'Partial payment', TO_DATE('2025-11-02','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, tranDate, tranTime) VALUES
(3, 3, 3, 25000.00, 'Initial deposit', TO_DATE('2025-11-03','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, tranDate, tranTime) VALUES
(4, 4, 4, 10000.00, 'Monthly saving', TO_DATE('2025-11-04','YYYY-MM-DD'), SYSTIMESTAMP);
INSERT INTO Saving_Transaction (user_id, goal_id, account_id, amount, description, tranDate, tranTime) VALUES
(5, 5, 5, 20000.00, 'Initial deposit', TO_DATE('2025-11-05','YYYY-MM-DD'), SYSTIMESTAMP);

COMMIT;
