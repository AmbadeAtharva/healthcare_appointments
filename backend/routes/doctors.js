const express = require('express');
const router = express.Router();

// Mock doctor data (in real use, store in DB)
let doctors = [
  { id: 'd1', name: 'Dr. Smith', specialization: 'Cardiology' },
  { id: 'd2', name: 'Dr. Allen', specialization: 'Neurology' }
];

// Register a doctor
router.post('/register', (req, res) => {
  const { id, name, specialization } = req.body;
  doctors.push({ id, name, specialization });
  res.status(200).json({ message: 'Doctor registered successfully' });
});

// List all doctors
router.get('/', (req, res) => {
  res.json(doctors);
});

module.exports = router;
