import React, { useState } from 'react';
import axios from 'axios';

function ScheduleAppointment({ onScheduled }) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !doctorName || !date || !time) {
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      const response = await axios.post(
        'http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments',
        { patientName, doctorName, date, time }
      );
      setMessage(response.data.message || 'Appointment created.');
      onScheduled(); // refresh the appointment list
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error || 'Failed to schedule appointment.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Patient Name"
        value={patientName}
        onChange={(e) => setPatientName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Doctor Name"
        value={doctorName}
        onChange={(e) => setDoctorName(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button type="submit">Schedule</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default ScheduleAppointment;
