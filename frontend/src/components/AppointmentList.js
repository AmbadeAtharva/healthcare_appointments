import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments');
        setAppointments(res.data.data || []);  // <-- Corrected here
      } catch (err) {
        console.error('Error fetching appointments', err);
      }
    }
    fetchAppointments();
  }, []);

  return (
    <div className="appointment-list">
      <h2>Scheduled Appointments</h2>
      {Array.isArray(appointments) && appointments.map((appointment, index)  => (
        <div className="appointment-item" key={appointment.appointmentId}>
          <strong>Patient:</strong> {appointment.patient}<br />
          <strong>Doctor:</strong> {appointment.doctor}<br />
          <strong>Date:</strong> {new Date(appointment.date).toLocaleString()}<br />
          <strong>Location:</strong> {appointment.location}
        </div>
      ))}
    </div>
  );
}
