import './App.css';
import React, { useState } from 'react';
import ScheduleAppointment from './components/ScheduleAppointment';
import AppointmentList from './components/AppointmentList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleScheduled = (message = '') => {
    setRefreshFlag((prev) => prev + 1);
    setStatusMessage(message);
  };

  return (
    <div className="container py-5 text-center">
      {statusMessage && (
        <div className="alert alert-info" role="alert">
          {statusMessage}
        </div>
      )}

      <h1 className="mb-4">Healthcare Scheduler</h1>

      <div className="card p-4 mb-4 shadow-sm">
        <ScheduleAppointment onScheduled={handleScheduled} />
      </div>

      <div className="card p-4 shadow-sm">
        <AppointmentList refreshFlag={refreshFlag} onRefresh={handleScheduled} />
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
}

export default App;
