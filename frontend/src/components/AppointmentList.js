import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error('Error fetching appointments', err);
      }
    }
    fetchAppointments();
  }, []);

  return (
    <div className="appointment-list">
  <h2>Scheduled Appointments</h2>
  {appointments.map((appt) => (
    <div className="appointment-item" key={appt.id}>
      <strong>Patient:</strong> {appt.patientId}<br />
      <strong>Doctor:</strong> {appt.doctorId}<br />
      <strong>Date:</strong> {new Date(appt.date).toLocaleString()}<br />
      <strong>Location:</strong> {appt.location}
    </div>
  ))}
</div>

  );
}
