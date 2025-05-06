const express = require('express');
const router = express.Router();

// In-memory mock appointment list
let appointments = [
  {
    id: 1,
    patientId: 'p1',
    doctorId: 'd1',
    date: '2025-05-06T10:00',
    location: 'Room 101'
  },
  {
    id: 2,
    patientId: 'p2',
    doctorId: 'd2',
    date: '2025-05-06T11:00',
    location: 'Room 202'
  }
];

// 📅 Create a new appointment
router.post('/schedule', (req, res) => {
  const { patientId, doctorId, date, location } = req.body;

  // 🔒 Backend Validation
  if (!patientId || !doctorId || !date || !location) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const newAppt = {
    id: appointments.length + 1,
    patientId,
    doctorId,
    date,
    location
  };

  appointments.push(newAppt);
  res.status(201).json({ message: 'Appointment scheduled', appointment: newAppt });
});

// 📋 Get all appointments
router.get('/', (req, res) => {
  res.status(200).json(appointments);
});

module.exports = router;
