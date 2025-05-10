import './App.css';
import React, { useState } from 'react';
import ScheduleAppointment from './components/ScheduleAppointment';
import AppointmentList from './components/AppointmentList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleScheduled = () => {
    setRefreshFlag((prev) => prev + 1);  // Triggers re-fetch in AppointmentList
  };

  return (
    <div className="container">
      <h1>Healthcare Scheduler</h1>
      <div className="schedule-form">
        <ScheduleAppointment onScheduled={handleScheduled} />
      </div>
      <div className="appointment-list-section">
        <AppointmentList refreshFlag={refreshFlag} onRefresh={handleScheduled} />
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}

export default App;
