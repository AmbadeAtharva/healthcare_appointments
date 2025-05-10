import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

  // Load dropdown data
  useEffect(() => {
    async function fetchData() {
      try {
        const [patientsRes, doctorsRes] = await Promise.all([
          axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/patients'),
          axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/doctors'),
        ]);
        setPatients(patientsRes.data);
        setDoctors(doctorsRes.data);
      } catch (error) {
        console.error('Failed to load dropdown data', error);
      }
    }

    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientName || !doctorName || !serviceNeeded || !date || !time) {
      setMessage('Please fill out all fields.');
      return;
    }

    try {
      const payload = {
        patientName: patientName.trim(),
        doctorName: doctorName.trim(),
        serviceNeeded: serviceNeeded.trim(),
        date,
        time,
        location
      };

      const response = await axios.post('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments', payload);

      if (response.data.alternatives) {
        setMessage(`Doctor ${doctorName} is already booked at this time. Suggested alternatives: ${response.data.alternatives.join(', ')}`);
      } else {
        toast.success(response.data.message || 'Appointment created.');
        onScheduled();
        setMessage('');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to schedule appointment.');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
      <select value={patientName} onChange={(e) => setPatientName(e.target.value)} className="form-control mb-2">
        <option value="">Select Patient</option>
        {patients.map((p) => (
          <option key={p.id} value={p.name}>{p.name}</option>
        ))}
      </select>

      <select value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className="form-control mb-2">
        <option value="">Select Doctor</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.name}>{d.name}</option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Service Needed"
        value={serviceNeeded}
        onChange={(e) => setServiceNeeded(e.target.value)}
        className="form-control mb-2"
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="form-control mb-2"
      />

      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        className="form-control mb-2"
      />

      <input
        type="text"
        placeholder="Location (Optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="form-control mb-2"
      />

      <button type="submit" className="btn btn-primary">Schedule</button>

      {message && <div style={{ color: 'red', marginTop: '10px' }}>{message}</div>}
    </form>
  );
}

export default ScheduleAppointment;
