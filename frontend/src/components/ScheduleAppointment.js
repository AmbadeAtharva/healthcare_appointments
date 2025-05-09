import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ScheduleAppointment({ onScheduled }) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Fetch dropdown options
  useEffect(() => {
    async function fetchDropdownData() {
      try {
        const [pRes, dRes] = await Promise.all([
          axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/patients'),
          axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/doctors'),
        ]);
        setPatients(pRes.data);
        setDoctors(dRes.data);
      } catch (err) {
        console.error('Failed to load dropdown options:', err);
      }
    }

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !doctorName || !date || !time) {
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      const payload = {
        patientName: patientName.trim(),
        doctorName: doctorName.trim(),
        date,
        time,
        location: location.trim()
      };
      

      const response = await axios.post(
        'http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments',
        payload
      );

      setMessage(response.data.message || 'Appointment created.');
      onScheduled(); // Refresh list
    } catch (error) {
      console.error(error);
      setMessage(
        error.response?.data?.error || 'Failed to schedule appointment.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={patientName} onChange={(e) => setPatientName(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.name}>{p.name}</option>
        ))}
      </select>

      <select value={doctorName} onChange={(e) => setDoctorName(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.name}>{d.name}</option>
        ))}
      </select>

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

      <input
  type="text"
  placeholder="Location"
  value={location}
  onChange={(e) => setLocation(e.target.value)}
/>
    </form>
  );
}

export default ScheduleAppointment;
