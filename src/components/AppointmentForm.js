import React, { useState } from 'react';
import api from '../services/api';

const AppointmentForm = () => {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await api.scheduleAppointment({ patientId, doctorId, appointmentTime });
    console.log(response);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={patientId} onChange={(e) => setPatientId(e.target.value)} placeholder="Patient ID" />
      <input type="text" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} placeholder="Doctor ID" />
      <input type="datetime-local" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
      <button type="submit">Schedule Appointment</button>
    </form>
  );
};

export default AppointmentForm;
