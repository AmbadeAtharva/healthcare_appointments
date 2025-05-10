import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function AppointmentList({ refreshFlag, onRefresh }) {
  const [appointments, setAppointments] = useState([]);
  const [view, setView] = useState('upcoming'); // Toggle state

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
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;

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

  const now = new Date();
  const upcomingAppointments = appointments.filter(a => new Date(a.date) >= now);
  const pastAppointments = appointments.filter(a => new Date(a.date) < now);

  const renderAppointments = (list) =>
    list.map((appointment) => (
<table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
  <thead>
    <tr>
      <th>Patient Name</th>
      <th>Doctor Name</th>
      <th>Date</th>
      <th>Time</th>
      <th>Location</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {filteredAppointments.map(appointment => (
      <tr key={appointment.appointmentId}>
        <td>{appointment.patient}</td>
        <td>{appointment.doctor}</td>
        <td>{appointment.date}</td>
        <td>{appointment.time || 'Not specified'}</td>
        <td>{appointment.location || 'Not specified'}</td>
        <td>
          <button onClick={() => handleDelete(appointment.appointmentId)}>
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

    ));

  return (
    <div className="appointment-list">
      <h2>Scheduled Appointments</h2>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setView('upcoming')} style={{ marginRight: '5px', backgroundColor: view === 'upcoming' ? 'blue' : 'gray', color: 'white' }}>
          Upcoming Appointments
        </button>
        <button onClick={() => setView('past')} style={{ backgroundColor: view === 'past' ? 'blue' : 'gray', color: 'white' }}>
          Past Appointments
        </button>
      </div>

      {view === 'upcoming' ? (
        <>
          <h3>Upcoming Appointments ({upcomingAppointments.length})</h3>
          {upcomingAppointments.length > 0 ? renderAppointments(upcomingAppointments) : <p>No upcoming appointments.</p>}
        </>
      ) : (
        <>
          <h3>Past Appointments ({pastAppointments.length})</h3>
          {pastAppointments.length > 0 ? renderAppointments(pastAppointments) : <p>No past appointments.</p>}
        </>
      )}
    </div>
  );
}
