import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AppointmentList({ refreshFlag, onRefresh }) {
  const [appointments, setAppointments] = useState([]);
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [refreshFlag]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  const handleDelete = async (appointmentId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this appointment?');
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments/${appointmentId}`);
      setAppointments(prev => prev.filter(a => a.appointmentId !== appointmentId));
      toast.success('Appointment deleted successfully.');
      onRefresh();
    } catch (error) {
      console.error('Failed to delete appointment', error);
      toast.error('Failed to delete appointment.');
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const matchPatient = patientFilter === '' || appointment.patient.toLowerCase().includes(patientFilter.toLowerCase());
    const matchDoctor = doctorFilter === '' || appointment.doctor.toLowerCase().includes(doctorFilter.toLowerCase());
    const matchDate = dateFilter === '' || appointment.date === dateFilter;
    return matchPatient && matchDoctor && matchDate;
  });

  return (
    <div className="appointment-list">
      <h2>Scheduled Appointments ({filteredAppointments.length})</h2>

      <div style={{ marginBottom: '10px' }}>
        <input type="text" placeholder="Filter by Patient Name" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} />
        <input type="text" placeholder="Filter by Doctor Name" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>

      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((appointment) => (
          <div key={appointment.appointmentId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '5px' }}>
            <strong>Patient:</strong> {appointment.patient}<br />
            <strong>Doctor:</strong> {appointment.doctor}<br />
            <strong>Service Required:</strong> {appointment.serviceRequired || 'Not specified'}<br />
            <strong>Date:</strong> {appointment.date}<br />
            <strong>Time:</strong> {appointment.time || 'Not specified'}<br />
            <strong>Location:</strong> {appointment.location || 'Not specified'}<br />
            <button onClick={() => handleDelete(appointment.appointmentId)} style={{ marginTop: '5px', backgroundColor: 'red', color: 'white' }}>
              Delete
            </button>
          </div>
        ))
      ) : (
        <p>No appointments match the filter.</p>
      )}
    </div>
  );
}
