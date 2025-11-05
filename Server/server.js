//Import dependencies
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

//Initialize express app
const app = express();

//Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Health check route
app.get('/', (req, res) =>
  res.send('Melony - Personal Finance Management App Backend Running...!!!')
);

//Import routes and sync manager
const { syncPendingActions } = require("./sync/syncManager");
const { syncPendingLocalActions } = require("./sync/localSyncManager");
const { syncPendingAccountActions } = require("./sync/syncAccountManager");

const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const savingGoalRoutes = require('./routes/savingGoalRoutes');
const savingTransactionRoutes = require('./routes/savingTransactionRoutes');

//Mount API routes
app.use('/api/users', userRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savingsGoals', savingGoalRoutes);
app.use('/api/savingTransactions', savingTransactionRoutes);


//Define port
const PORT = process.env.PORT || 3000;

//Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

//Run pending sync actions on startup
(async () => {
  try {
    await syncPendingActions();
    await syncPendingLocalActions();
  } catch (err) {
    console.error("Error running sync on startup:", err.message);
  }
})();

//Schedule automatic sync every 5 minutes
setInterval(async () => {
  try {
    await syncPendingActions();
    await syncPendingAccountActions();

  } catch (err) {
    console.error("Error running scheduled sync:", err.message);
  }
}, 10 * 60 * 1000);
