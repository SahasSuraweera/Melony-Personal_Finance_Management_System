const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Backend is working!');
});


app.get('/userInfo', (req, res) => {
  const sampleUsers = [
    { user_id: 1, firstName: 'Sahan', lastName: 'Fernando', email: 'sahan.f1@gmail.com' },
    { user_id: 2, firstName: 'Kavindi', lastName: 'Jayasinghe', email: 'kavindi.j1@gmail.com' },
    { user_id: 2, firstName: 'Kavindi', lastName: 'Jayasinghe', email: 'kavindi.j1@gmail.com' }
  ];
  res.json(sampleUsers);
});

app.listen(5000, () => console.log('Server running on port 5000'));
