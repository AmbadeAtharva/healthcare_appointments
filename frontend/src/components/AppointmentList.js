import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AppointmentList({ refreshFlag, onRefresh }) {
  const [appointments, setAppointments] = useState([]);
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Fetch appointments when component mounts or refreshFlag changes
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
      onRefresh();  // Trigger list refresh
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

  const now = new Date();
  const upcomingAppointments = filteredAppointments.filter(a => new Date(a.date) >= now);
  const pastAppointments = filteredAppointments.filter(a => new Date(a.date) < now);

  const renderAppointments = (list) => (
    list.map(a => (
      <div key={a.appointmentId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '5px' }}>
        <strong>Patient:</strong> {a.patient}<br />
        <strong>Doctor:</strong> {a.doctor}<br />
        <strong>Date:</strong> {a.date}<br />
        <strong>Time:</strong> {a.time || 'Not specified'}<br />
        <strong>Location:</strong> {a.location || 'Not specified'}<br />
        <button onClick={() => handleDelete(a.appointmentId)} style={{ marginTop: '5px', backgroundColor: 'red', color: 'white' }}>
          Delete
        </button>
      </div>
    ))
  );

  return (
    <div className="appointment-list">
      <h2>Scheduled Appointments ({filteredAppointments.length})</h2>

      <div style={{ marginBottom: '10px' }}>
        <input type="text" placeholder="Filter by Patient Name" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} />
        <input type="text" placeholder="Filter by Doctor Name" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} />
        <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* Upcoming Appointments Column */}
        <div style={{ flex: 1, borderRight: '1px solid #ccc', paddingRight: '10px' }}>
          <h3>Upcoming Appointments ({upcomingAppointments.length})</h3>
          {upcomingAppointments.length > 0 ? renderAppointments(upcomingAppointments) : <p>No upcoming appointments.</p>}
        </div>

        {/* Past Appointments Column */}
        <div style={{ flex: 1, paddingLeft: '10px' }}>
          <h3>Past Appointments ({pastAppointments.length})</h3>
          {pastAppointments.length > 0 ? renderAppointments(pastAppointments) : <p>No past appointments.</p>}
        </div>
      </div>
    </div>
  );
}
