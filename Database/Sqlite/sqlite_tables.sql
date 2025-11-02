PRAGMA foreign_keys = ON;

-- ADMIN table
CREATE TABLE AdminInfo (
    admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    officeEmail TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    officePhone TEXT NOT NULL
);

-- USER table
CREATE TABLE UserInfo (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    occupation TEXT NOT NULL,
    houseNO TEXT NOT NULL,
    streetName TEXT NOT NULL,
    city TEXT NOT NULL
);

-- USER_PHONES table
CREATE TABLE User_Phone (
    user_id INTEGER NOT NULL,
    phone TEXT NOT NULL,
    isPrimary TEXT DEFAULT 'Y' CHECK (isPrimary IN ('Y', 'N')),
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id)
);

-- NOTE table
CREATE TABLE Note (
    note_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    actionDate DATE,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id)
);

-- ACCOUNT_TYPE table
CREATE TABLE Account_Type (
    acc_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
    accTypeName TEXT NOT NULL,
    assetOrLiability TEXT CHECK(assetOrLiability IN ('Asset','Liability'))
);

-- ACCOUNT table
CREATE TABLE Account (
    account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    acc_type_id INTEGER NOT NULL,
    nickname TEXT,
    reference TEXT,
    institution TEXT,
    balance REAL DEFAULT 0,
    isActive TEXT DEFAULT 'Y' CHECK (isActive IN ('Y', 'N')),
    FOREIGN KEY (acc_type_id) REFERENCES Account_Type(acc_type_id),
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id)
);

-- TRANSACTION_CATEGORY table
CREATE TABLE Transaction_Category (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoryName TEXT NOT NULL
);

-- TRANSACTION table
CREATE TABLE Transaction_Info(
    transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    category_id INTEGER,
    amount REAL NOT NULL,
    transactionType TEXT CHECK (transactionType IN ('Income', 'Expense')),
    description TEXT,
    tranDate DATE DEFAULT CURRENT_DATE,
    tranTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_id),
    FOREIGN KEY (category_id) REFERENCES Transaction_Category(category_id)
);

-- BUDGET table
CREATE TABLE Budget (
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    warningLimit REAL NOT NULL,
    maximumLimit REAL NOT NULL,
    description TEXT,
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id),
    FOREIGN KEY (category_id) REFERENCES Transaction_Category(category_id)
);

-- INTERNAL_TRANSACTIONS table
CREATE TABLE Internal_Transaction (
    int_tran_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    from_account_id INTEGER NOT NULL,
    to_account_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    transferType TEXT NOT NULL,
    description TEXT,
    tranDate DATE DEFAULT CURRENT_DATE,
    tranTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id),
    FOREIGN KEY (from_account_id) REFERENCES Account(account_id),
    FOREIGN KEY (to_account_id) REFERENCES Account(account_id)
);

-- SAVING_GOAL table
CREATE TABLE Saving_Goal (
    goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    goalName TEXT NOT NULL,
    targetAmount REAL,
    currentAmount REAL DEFAULT 0,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    isActive TEXT DEFAULT 'Y' CHECK(isActive IN ('Y','N')),
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_id)
);

-- SAVING_TRANSACTION table
CREATE TABLE Saving_Transaction (
    saving_transaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_id INTEGER NOT NULL,
    account_id INTEGER NOT NULL,
    amount REAL,
    description TEXT,
    tranDate DATE DEFAULT CURRENT_DATE,
    tranTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserInfo(user_id),
    FOREIGN KEY (goal_id) REFERENCES Saving_Goal(goal_id),
    FOREIGN KEY (account_id) REFERENCES Account(account_id)
);
