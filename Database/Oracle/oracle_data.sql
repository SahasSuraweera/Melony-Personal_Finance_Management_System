-- ACCOUNT_TYPE table
-- ASSETS
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(1, 'Cash', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(2, 'Bank Savings Account', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(3, 'Bank Current / Business Account', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(4, 'Investment Account', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(5, 'Property / Real Estate', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(6, 'Receivables', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(7, 'Digital Assets', 'Asset');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(8, 'Other Assets', 'Asset');
-- LIABILITIES
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(9, 'Loan / Credit Facility', 'Liability');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(10, 'Credit Card', 'Liability');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(11, 'Mortgage Loan', 'Liability');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(12, 'Vehicle Loan', 'Liability');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(13, 'Utilities / Bills Payable', 'Liability');
INSERT INTO Account_Type (acc_type_id, accTypeName, assetOrLiability) VALUES 
(14, 'Other Liabilities', 'Liability');

-- TRANSACTION_CATEGORY table
-- EXPENSE CATEGORIES (1–15)
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (1, 'Food and Groceries');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (2, 'Transportation');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (3, 'Utilities');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (4, 'Rent');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (5, 'Healthcare');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (6, 'Insurance');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (7, 'Education');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (8, 'Shopping');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (9, 'Entertainment');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (10, 'Travel');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (11, 'Taxes');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (12, 'Gifts and Donations');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (13, 'Household');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (14, 'Pets');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (15, 'Other Expenses');

--INCOME CATEGORIES (16–25)
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (16, 'Salary');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (17, 'Freelance Income');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (18, 'Business Income');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (19, 'Investment Income');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (20, 'Interest Income');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (21, 'Rent Received');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (22, 'Refunds');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (23, 'Gift Income');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (24, 'Dividend');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (25, 'Other Income');

-- TRANSFER CATEGORIES (26–30)
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (26, 'Withdrawal');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (27, 'Account Transfer');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (28, 'Own Credit Card Payment');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (29, 'Own Loan Payment');
INSERT INTO Transaction_Category (category_id, categoryName) VALUES (30, 'Other Transfers');