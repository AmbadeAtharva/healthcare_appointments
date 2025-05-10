import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    <div className="container my-4 d-flex justify-content-center">
      <div className="card shadow w-100" style={{ maxWidth: '900px' }}>
        <div className="card-body">
          <h2 className="card-title">Scheduled Appointments ({filteredAppointments.length})</h2>

          <div className="d-flex gap-2 mb-3">
            <input className="form-control" type="text" placeholder="Filter by Patient Name" value={patientFilter} onChange={(e) => setPatientFilter(e.target.value)} />
            <input className="form-control" type="text" placeholder="Filter by Doctor Name" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)} />
            <input className="form-control" type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Service</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.appointmentId}>
                      <td>{appointment.patient}</td>
                      <td>{appointment.doctor}</td>
                      <td>{appointment.serviceRequired || 'Not specified'}</td>
                      <td>{appointment.date}</td>
                      <td>{appointment.time || 'Not specified'}</td>
                      <td>{appointment.location || 'Not specified'}</td>
                      <td>
                        <button onClick={() => handleDelete(appointment.appointmentId)} className="btn btn-danger btn-sm">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No appointments match the filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}
