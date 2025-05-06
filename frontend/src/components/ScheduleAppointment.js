import React, { useState } from 'react';
import axios from 'axios';

const ScheduleAppointment = ({ onAppointmentScheduled }) => {
  const [patientId, setPatientId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId.trim() || !doctorId.trim() || !date || !location.trim()) {
      alert('Please fill out all fields before scheduling.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5001/api/appointments/schedule', {
        patientId,
        doctorId,
        date,
        location,
      });

      if (response.data.message) {
        alert(response.data.message); // Success or warning message
      }

      setPatientId('');
      setDoctorId('');
      setDate('');
      setLocation('');
      onAppointmentScheduled();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to schedule appointment.';
      alert(message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Patient ID" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
      <input type="text" placeholder="Doctor ID" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
      <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
      <button type="submit">Schedule</button>
    </form>
  );
};

export default ScheduleAppointment;
