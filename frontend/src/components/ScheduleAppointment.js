import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ScheduleAppointment({ onScheduled }) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, dRes] = await Promise.all([
          axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/patients'),
          axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/doctors')
        ]);
        setPatients(pRes.data);
        setDoctors(dRes.data);
      } catch (error) {
        console.error('Error loading dropdown options:', error);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !doctorName || !serviceNeeded || !date || !time) {
      setMessage('All fields (patientName, doctorName, serviceNeeded, date, time) are required.');
      return;
    }

    try {
      const payload = { patientName, doctorName, serviceNeeded, date, time, location };
      const response = await axios.post('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments', payload);

      setMessage(response.data.message || 'Appointment created.');
      onScheduled();
    } catch (error) {
      console.error(error);
    
      const errorMessage = error.response?.data?.error || 'Failed to schedule appointment.';
      const alternatives = error.response?.data?.alternatives;
    
      let fullMessage = errorMessage;
      if (alternatives && alternatives.length > 0 && alternatives[0] !== 'No alternatives available') {
        fullMessage += ' ' + alternatives.join(', ');
      }
    
      setMessage(fullMessage);
    }
    
  };

  return (
    <form onSubmit={handleSubmit}>
      <select value={patientName} onChange={(e) => setPatientName(e.target.value)}>
        <option value="">Select Patient</option>
        {patients.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
      </select>

      <select value={doctorName} onChange={(e) => setDoctorName(e.target.value)}>
        <option value="">Select Doctor</option>
        {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
      </select>

      <select value={serviceNeeded} onChange={(e) => setServiceNeeded(e.target.value)}>
        <option value="">Select Service Needed</option>
        <option value="Cardiology">Cardiology</option>
        <option value="Dermatology">Dermatology</option>
        <option value="Neurology">Neurology</option>
        <option value="Pediatrics">Pediatrics</option>
        <option value="General">General</option>
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      <input type="text" placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />

      <button type="submit">Schedule</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default ScheduleAppointment;
