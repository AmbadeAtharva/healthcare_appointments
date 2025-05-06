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

import './App.css';
import React from 'react';
import ScheduleAppointment from './components/ScheduleAppointment';
import AppointmentList from './components/AppointmentList';

function App() {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Healthcare Scheduler</h1>
      <ScheduleAppointment />
      <AppointmentList />
    </div>
  );
}

export default App;
