const express = require('express');
const router = express.Router();
const appointmentController = require('../../src/controllers/appointmentController');

router.post('/appointments', appointmentController.createAppointment);

module.exports = router;
