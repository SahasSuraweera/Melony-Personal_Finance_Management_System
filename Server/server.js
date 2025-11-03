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
const userRoutes = require('./routes/userRoutes');

//Mount API routes
app.use('/api/users', userRoutes);

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
  } catch (err) {
    console.error("Error running scheduled sync:", err.message);
  }
}, 5 * 60 * 1000);
