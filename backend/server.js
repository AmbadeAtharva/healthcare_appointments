const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json());

app.use('/api/patients', require('../backend/routes/patients'));
app.use('/api/doctors', require('../backend/routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/graph', require('../backend/routes/graph'));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
