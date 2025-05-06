const { scheduleAppointment } = require('../services/neptuneService');

exports.createAppointment = async (req, res) => {
  const { patientId, doctorId, appointmentTime } = req.body;
  const appointment = await scheduleAppointment(patientId, doctorId, appointmentTime);
  res.status(201).json(appointment);
};
