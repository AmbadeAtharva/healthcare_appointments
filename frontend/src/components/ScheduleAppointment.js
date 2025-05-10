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
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // New Patient Form State
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientMessage, setNewPatientMessage] = useState('');

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !doctorName || !serviceNeeded || !date || !time) {
      toast.error('All fields except location are required.');
      return;
    }

    try {
      const payload = { patientName, doctorName, serviceNeeded, date, time, location };
      const response = await axios.post('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments', payload);
      toast.success(response.data.message || 'Appointment created.');
      onScheduled();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Failed to schedule appointment.');
    }
  };

  const handleNewPatientSubmit = async (e) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      setNewPatientMessage('Patient name is required.');
      return;
    }

    try {
      await axios.post('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/patients', {
        name: newPatientName.trim(),
        age: newPatientAge.trim(),
      });
      setNewPatientMessage('New patient added successfully.');
      setNewPatientName('');
      setNewPatientAge('');
      fetchDropdownData();
    } catch (error) {
      console.error(error);
      setNewPatientMessage('Failed to add new patient.');
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
        <button type="button" className="btn btn-secondary" onClick={() => setShowNewPatientForm(!showNewPatientForm)}>
          {showNewPatientForm ? 'Cancel' : 'Add New Patient'}
        </button>
      </form>

      {showNewPatientForm && (
        <form onSubmit={handleNewPatientSubmit} className="d-flex flex-wrap gap-2 justify-content-center align-items-center mt-3">
          <input className="form-control" type="text" placeholder="Patient Name" value={newPatientName} onChange={(e) => setNewPatientName(e.target.value)} style={{ maxWidth: '150px' }} />
          <input className="form-control" type="number" placeholder="Age (optional)" value={newPatientAge} onChange={(e) => setNewPatientAge(e.target.value)} style={{ maxWidth: '150px' }} />
          <button type="submit" className="btn btn-success">Submit New Patient</button>
          {newPatientMessage && <p className="mt-2">{newPatientMessage}</p>}
        </form>
      )}

      <ToastContainer position="top-center" />
    </div>
  );
}
