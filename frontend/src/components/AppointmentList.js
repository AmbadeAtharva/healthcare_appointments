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
      <div key={appointment.appointmentId} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '5px' }}>
        <strong>Patient:</strong> {appointment.patient}<br />
        <strong>Doctor:</strong> {appointment.doctor}<br />
        <strong>Date:</strong> {appointment.date}<br />
        <strong>Time:</strong> {appointment.time || 'Not specified'}<br />
        <strong>Location:</strong> {appointment.location || 'Not specified'}<br />
        <button onClick={() => handleDelete(appointment.appointmentId)} style={{ marginTop: '5px', backgroundColor: 'red', color: 'white' }}>
          Delete
        </button>
      </div>
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
