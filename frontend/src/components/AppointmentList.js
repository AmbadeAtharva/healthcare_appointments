import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function AppointmentList({ refreshFlag }) {
  const [appointments, setAppointments] = useState([]);
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    async function fetchAppointments() {
      try {
        const res = await axios.get('http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments');
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error('Error fetching appointments', err);
      }
    }

    fetchAppointments();
  }, [refreshFlag]);

  const filteredAppointments = appointments.filter(appointment => {
    const matchPatient = patientFilter === '' || appointment.patient.toLowerCase().includes(patientFilter.toLowerCase());
    const matchDoctor = doctorFilter === '' || appointment.doctor.toLowerCase().includes(doctorFilter.toLowerCase());
    const matchDate = dateFilter === '' || appointment.date === dateFilter;
    return matchPatient && matchDoctor && matchDate;
  });

  return (
    <div className="appointment-list">
      <h2>Scheduled Appointments</h2>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Filter by Patient Name"
          value={patientFilter}
          onChange={(e) => setPatientFilter(e.target.value)}
        />
        <input
          type="text"
          placeholder="Filter by Doctor Name"
          value={doctorFilter}
          onChange={(e) => setDoctorFilter(e.target.value)}
        />
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((appointment) => (
          <div className="appointment-item" key={appointment.appointmentId}>
            <strong>Patient:</strong> {appointment.patient}<br />
            <strong>Doctor:</strong> {appointment.doctor}<br />
            <strong>Date:</strong> {new Date(appointment.date).toLocaleString()}<br />
          </div>
        ))
      ) : (
        <p>No appointments match the filter.</p>
      )}
    </div>
  );
}
