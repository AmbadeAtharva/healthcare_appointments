const express = require('express');
const router = express.Router();
const gremlin = require('gremlin');

const { DriverRemoteConnection } = gremlin.driver;
const { Graph } = gremlin.structure;
const { patientName, doctorName, date, time, location } = req.body;


const NEPTUNE_ENDPOINT = 'wss://db-neptune-1-instance-1.cqt62osoynt7.us-east-1.neptune.amazonaws.com:8182/gremlin';

const getTraversal = () => {
  const connection = new DriverRemoteConnection(NEPTUNE_ENDPOINT, {
    mimeType: 'application/vnd.gremlin-v2.0+json',
    pingEnabled: false,
  });
  const graph = new Graph();
  return graph.traversal().withRemote(connection);
};



module.exports = router;


// -------------- Get queries --------------

// insert Dummy data
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/init-data
const __ = gremlin.process.statics;
router.get('/init-data', async (req, res) => {
  try {
    const g = getTraversal();
    const results = [];

    // Create patients (names stored in lowercase)
    const alice = await g.addV('patient')
      .property('name', 'alice')
      .property('age', 30)
      .next();

    const bob = await g.addV('patient')
      .property('name', 'bob')
      .property('age', 45)
      .next();

    // Create doctors (names stored in lowercase)
    const smith = await g.addV('doctor')
      .property('name', 'dr. smith')
      .property('specialty', 'Cardiology')
      .next();

    const lee = await g.addV('doctor')
      .property('name', 'dr. lee')
      .property('specialty', 'Dermatology')
      .next();

    // Add appointments using __.V()
    results.push(await g.V(alice.value.id)
      .addE('hasAppointment')
      .to(__.V(smith.value.id))
      .property('date', '2025-05-10')
      .property('time', '10:00 AM')
      .next());

    results.push(await g.V(bob.value.id)
      .addE('hasAppointment')
      .to(__.V(lee.value.id))
      .property('date', '2025-05-12')
      .property('time', '2:00 PM')
      .next());

    res.json({ message: 'Inserted patients, doctors, and appointments', results });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Failed to insert data', details: err.message });
  }
});


// GET /api/graph/patients
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/patients
router.get('/patients', async (req, res) => {
  try {
    const g = getTraversal();

    // Fetch all patient vertices with properties
    const results = await g.V().hasLabel('patient').valueMap(true).toList();

    const simplified = results.map(entry => ({
      id: entry.id,
      label: entry.label,
      name: entry.name ? entry.name[0] : '',
      age: entry.age ? entry.age[0] : ''
    }));

    res.json(simplified);
  } catch (err) {
    console.error('Gremlin error:', err);
    res.status(500).json({ error: 'Neptune query failed' });
  }
});

// GET all doctors
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/doctors
router.get('/doctors', async (req, res) => {
  try {
    const g = getTraversal();
    const results = await g.V().hasLabel('doctor').valueMap(true).toList();

    const simplified = results.map(entry => ({
      id: entry.id,
      label: entry.label,
      name: entry.name ? entry.name[0] : '',
      specialty: entry.specialty ? entry.specialty[0] : ''
    }));

    res.json(simplified);
  } catch (err) {
    console.error('Gremlin error (doctors):', err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// GET all appointments with patient + doctor + time
// http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/appointments
router.get('/appointments', async (req, res) => {
  try {
    const g = getTraversal();

    const results = await g.E()
      .hasLabel('hasAppointment')
      .project('appointmentId', 'date', 'time', 'patient', 'doctor')
      .by(__.id())
      .by(__.values('date'))
      .by(__.values('time'))
      .by(__.outV().values('name'))
      .by(__.inV().values('name'))
      .toList();

    if (!results.length) {
      return res.json({ message: 'No appointments found', data: [] });
    }

    res.json({ message: 'Appointments fetched successfully', data: results });
  } catch (err) {
    console.error('Gremlin error (appointments):', err);
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
});


// -------- Post Queries ----------

router.post('/appointments', async (req, res) => {
  try {
    const g = getTraversal();
    const { patientName, doctorName, date, time } = req.body;

    if (!patientName || !doctorName || !date || !time) {
      return res.status(400).json({ error: 'All fields (patientName, doctorName, date, time) are required.' });
    }

        // Required for Gremlin statics
        const __ = gremlin.process.statics;

        const allPatients = await g.V().hasLabel('patient').valueMap(true).toList();
const allDoctors = await g.V().hasLabel('doctor').valueMap(true).toList();

// Normalize inputs for comparison
const normalizedPatient = patientName.trim().toLowerCase();
const normalizedDoctor = doctorName.trim().toLowerCase();

// Filter in JavaScript (safe)
const patientList = allPatients.filter(p => p.name && p.name[0].toLowerCase() === normalizedPatient);
const doctorList = allDoctors.filter(d => d.name && d.name[0].toLowerCase() === normalizedDoctor);

// Debugging Output
console.log('Patient Lookup Result:', patientList);
console.log('Doctor Lookup Result:', doctorList);

// Validate presence
if (patientList.length === 0 || doctorList.length === 0) {
  return res.status(404).json({
    error: 'Patient or Doctor not found.',
    details: {
      patientFound: patientList.length > 0,
      doctorFound: doctorList.length > 0
    }
  });
}

    const patient = patientList[0];
    const doctor = doctorList[0];

    // Create the appointment edge
    const result = await g.V(patientList[0].id)
    .addE('hasAppointment')
    .to(__.V(doctorList[0].id))
    .property('date', date)
    .property('time', time)
    .property('location', location || '')
    .next();

    console.log('Appointment Edge Creation Result:', result);

    res.status(201).json({ message: 'Appointment created successfully.', edge: result.value });
  } catch (err) {
    console.error('Insert appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment.', details: err.message });
  }
});


// -------- Drop Queries ----------

// Reset Patients Data
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/reset-patients
router.get('/reset-patients', async (req, res) => {
  try {
    const g = getTraversal();
    await g.V().hasLabel('patient').drop().iterate();
    res.send('All patient nodes deleted.');
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).send('Failed to reset patients.');
  }
});

// Reset Doctors Data
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/reset-doctors
router.get('/reset-doctors', async (req, res) => {
  try {
    const g = getTraversal();
    await g.V().hasLabel('doctor').drop().iterate();
    res.send('All doctor nodes deleted.');
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).send('Failed to reset doctors.');
  }
});

// Reset Appointments Data
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/reset-appointments
router.get('/reset-appointments', async (req, res) => {
  try {
    const g = getTraversal();
    await g.E().hasLabel('hasAppointment').drop().iterate();
    res.send('All appointment edges deleted.');
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).send('Failed to reset appointments.');
  }
});

// Reset All Data
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/reset-all
router.get('/reset-all', async (req, res) => {
  try {
    const g = getTraversal();
    await g.V().drop().iterate();
    res.send('All vertices deleted.');
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).send('Failed to reset graph.');
  }
});

// DELETE /api/graph/appointments/:appointmentId
router.delete('/appointments/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;

  if (!appointmentId) {
    return res.status(400).json({ error: 'Appointment ID is required' });
  }

  try {
    const g = getTraversal();
    await g.E(appointmentId).drop().iterate();
    res.status(200).json({ message: `Appointment ${appointmentId} deleted successfully.` });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete appointment.', details: err.message });
  }
});
