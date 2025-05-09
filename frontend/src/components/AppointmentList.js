import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AppointmentList({ refreshFlag }) {
  const [appointments, setAppointments] = useState([]);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments');
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error('Error fetching appointments', err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [refreshFlag]);

  const handleDelete = async (appointmentId) => {
    try {
      await axios.delete(`http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments/${appointmentId}`);
      fetchAppointments();  // Refresh the list after deletion
    } catch (err) {
      console.error('Error deleting appointment', err);
    }
  };

  return (
    <div className="appointment-list">
      <h2>Scheduled Appointments ({appointments.length})</h2>
      {Array.isArray(appointments) && appointments.length > 0 ? (
        appointments.map((appointment) => (
          <div className="appointment-item" key={appointment.appointmentId} style={{ border: '1px solid #ccc', padding: '8px', marginBottom: '8px' }}>
            <strong>Patient:</strong> {appointment.patient}<br />
            <strong>Doctor:</strong> {appointment.doctor}<br />
            <strong>Date:</strong> {appointment.date} {appointment.time}<br />
            <button onClick={() => handleDelete(appointment.appointmentId)} style={{ marginTop: '5px', color: 'red' }}>Delete</button>
          </div>
        ))
      ) : (
        <p>No appointments scheduled yet.</p>
      )}
    </div>
  );
}
