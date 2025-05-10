import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function ScheduleAppointment({ onScheduled }) {
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [fallbackMessage, setFallbackMessage] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

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
        toast.error('Failed to load patient or doctor list.');
      }
    }

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFallbackMessage('');

    if (!patientName || !doctorName || !serviceNeeded || !date || !time) {
      toast.error('All fields except location are required.');
      return;
    }

    try {
      const payload = { patientName, doctorName, serviceNeeded, date, time, location };
      const response = await axios.post('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments', payload);
      toast.success(response.data.message || 'Appointment created.');
      setPatientName('');
      setDoctorName('');
      setServiceNeeded('');
      setDate('');
      setTime('');
      setLocation('');
      setFallbackMessage('');
      onScheduled();
    } catch (error) {
      console.error(error);
      const fallbackMsg = error.response?.data?.message;
      const alternatives = error.response?.data?.alternatives;
      if (fallbackMsg && alternatives) {
        setFallbackMessage(`${fallbackMsg} ${alternatives.join(', ')}`);
      } else {
        toast.error(error.response?.data?.error || 'Failed to schedule appointment.');
      }
    }
  };

  return (
    <div className="container my-4 d-flex flex-column align-items-center">
      <form onSubmit={handleSubmit} className="d-flex flex-wrap gap-2 justify-content-center align-items-center">
        <select className="form-select" value={patientName} onChange={(e) => setPatientName(e.target.value)} style={{ maxWidth: '150px' }}>
          <option value="">Select Patient</option>
          {patients.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <select className="form-select" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} style={{ maxWidth: '150px' }}>
          <option value="">Select Doctor</option>
          {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>

        <select className="form-select" value={serviceNeeded} onChange={(e) => setServiceNeeded(e.target.value)} style={{ maxWidth: '180px' }}>
          <option value="">Select Service Needed</option>
          {['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics', 'General'].map(service => (
            <option key={service} value={service}>{service}</option>
          ))}
        </select>

        <input className="form-control" type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ maxWidth: '180px' }} />
        <input className="form-control" type="time" value={time} onChange={(e) => setTime(e.target.value)} style={{ maxWidth: '140px' }} />
        <input className="form-control" type="text" placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} style={{ maxWidth: '200px' }} />
        <button type="submit" className="btn btn-primary">Schedule</button>
      </form>

      {fallbackMessage && <div className="alert alert-warning mt-3">{fallbackMessage}</div>}
      <ToastContainer position="top-center" />
    </div>
  );
}
