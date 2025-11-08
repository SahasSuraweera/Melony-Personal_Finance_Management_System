
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) =>
  res.send('Melony - Personal Finance Management App Backend Running...!!!')
);

const { syncPendingUserActions } = require("./sync/user/syncUserManager");
const { syncPendingUserLocalActions } = require("./sync/user/syncUserLocalManager");
const { syncPendingNoteActions } = require("./sync/note/syncNoteManager");
const { syncPendingAccountActions } = require("./sync/account/syncAccountManager");
const { syncPendingBudgetActions } = require("./sync/budget/syncBudgetManager");
const { syncPendingTransactionActions } = require('./sync/transaction/syncTransactionManager');
const { syncPendingSavingGoalActions } = require('./sync/savinggoal/syncSavingGoalManager');
const { syncPendingSavingTransactionActions } = require('./sync/savingtransaction/syncSavingTransactionManager');

const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const accountRoutes = require('./routes/accountRoutes');
const accountTypeRoutes = require('./routes/accountTypeRoutes');
const transactionCategoryRoutes = require('./routes/transactionCategoryRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const savingGoalRoutes = require('./routes/savingGoalRoutes');
const savingTransactionRoutes = require('./routes/savingTransactionRoutes');

app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/accountTypes', accountTypeRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactionCategories', transactionCategoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savingsGoals', savingGoalRoutes);
app.use('/api/savingTransactions', savingTransactionRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

(async () => {
  try {
    await syncPendingUserLocalActions();
  } catch (err) {
    console.error("Error running sync on startup:", err.message);
  }
})();

setInterval(async () => {
  try {
    await syncPendingUserActions();
    await syncPendingNoteActions();
    await syncPendingAccountActions();
    await syncPendingBudgetActions();
    await syncPendingTransactionActions();
    await syncPendingSavingGoalActions();
    await syncPendingSavingTransactionActions();

  } catch (err) {
    console.error("Error running scheduled sync:", err.message);
  }
}, 10 * 60 * 1000);
