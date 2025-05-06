const express = require('express');
const router = express.Router();

// Mock patient data
let patients = [
  { id: 'p1', name: 'Alice' },
  { id: 'p2', name: 'Bob' }
];

// Register a patient
router.post('/register', (req, res) => {
  const { id, name } = req.body;
  patients.push({ id, name });
  res.status(200).json({ message: 'Patient registered successfully' });
});

// List all patients
router.get('/', (req, res) => {
  res.json(patients);
});

module.exports = router;
