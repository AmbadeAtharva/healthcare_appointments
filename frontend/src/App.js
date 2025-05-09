// import logo from './logo.svg';
// import './App.css';
// // comment
// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
// http://ec2-54-84-168-70.compute-1.amazonaws.com:3000

import './App.css';
import React, { useState } from 'react';
import ScheduleAppointment from './components/ScheduleAppointment';
import AppointmentList from './components/AppointmentList';

function App() {
  const [refreshFlag, setRefreshFlag] = useState(0);

  const handleScheduled = () => {
    setRefreshFlag((prev) => prev + 1);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Healthcare Scheduler</h1>
      <ScheduleAppointment onScheduled={handleScheduled} />
      <AppointmentList key={refreshFlag} />
    </div>
  );
}

export default App;

