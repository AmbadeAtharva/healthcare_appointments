const express = require('express');
const router = express.Router();
const gremlin = require('gremlin');

const { DriverRemoteConnection } = gremlin.driver;
const { Graph } = gremlin.structure;

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

const __ = gremlin.process.statics;

/** ---------------------- GET Queries ---------------------- **/

// Initialize dummy data
//http://ec2-54-84-168-70.compute-1.amazonaws.com:5001/api/graph/init-data

router.get('/init-data', async (req, res) => {
  try {
    const g = getTraversal();
    const results = [];

    // --- Patients ---
    const alice = await g.addV('patient')
      .property('name', 'alice')
      .property('age', 30)
      .next();

    const bob = await g.addV('patient')
      .property('name', 'bob')
      .property('age', 45)
      .next();

    results.push(alice, bob);

    // --- Expanded Doctors ---
    const doctorSpecs = [
      { name: 'dr. alice walker', specialty: 'Cardiology' },
      { name: 'dr. bob carter', specialty: 'Dermatology' },
      { name: 'dr. charlie green', specialty: 'Pediatrics' },
      { name: 'dr. diana prince', specialty: 'Orthopedics' },
      { name: 'dr. ethan hunt', specialty: 'Neurology' },
      { name: 'dr. frank ocean', specialty: 'General Practice' },
      { name: 'dr. grace lee', specialty: 'Ophthalmology' },
      { name: 'dr. harry potter', specialty: 'Oncology' },
      { name: 'dr. isabel king', specialty: 'Cardiology' },
      { name: 'dr. john doe', specialty: 'Orthopedics' },
      { name: 'dr. karen smith', specialty: 'Pediatrics' },
      { name: 'dr. leo messi', specialty: 'Sports Medicine' },
      { name: 'dr. mary jane', specialty: 'Gynecology' },
      { name: 'dr. nick fury', specialty: 'General Practice' },
      { name: 'dr. olivia brown', specialty: 'Neurology' }
    ];

    for (const doc of doctorSpecs) {
      const addedDoctor = await g.addV('doctor')
        .property('name', doc.name)
        .property('specialty', doc.specialty)
        .next();
      results.push(addedDoctor);
    }

    // --- Sample Appointments ---
    results.push(await g.V(alice.value.id)
      .addE('hasAppointment')
      .to(__.V(results.find(r => r.value.label === 'doctor').value.id))
      .property('date', '2025-05-10')
      .property('time', '10:00 AM')
      .property('location', '101')
      .property('serviceRequired', 'Cardiology')
      .next());

    results.push(await g.V(bob.value.id)
      .addE('hasAppointment')
      .to(__.V(results.find(r => r.value.label === 'doctor').value.id))
      .property('date', '2025-05-12')
      .property('time', '2:00 PM')
      .property('location', '102')
      .property('serviceRequired', 'Dermatology')
      .next());

    res.json({ message: 'Inserted patients, doctors, and appointments', results });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({ error: 'Failed to insert data', details: err.message });
  }
});


// Get all patients
router.get('/patients', async (req, res) => {
  try {
    const g = getTraversal();
    const results = await g.V().hasLabel('patient').valueMap(true).toList();
    const simplified = results.map(entry => ({
      id: entry.id,
      label: entry.label,
      name: entry.name ? entry.name[0] : '',
      age: entry.age ? entry.age[0] : ''
    }));
    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: 'Neptune query failed' });
  }
});

// Get all doctors
router.get('/doctors', async (req, res) => {
  try {
    const g = getTraversal();
    const results = await g.V().hasLabel('doctor').valueMap(true).toList();
    const simplified = results.map(entry => ({
      id: entry.id,
      label: entry.label,
      name: entry.name ? entry.name[0] : '',
      specialty: entry.specialty ? entry.specialty[0] : '',
      services: entry.services ? entry.services[0] : ''
    }));
    res.json(simplified);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get all appointments
router.get('/appointments', async (req, res) => {
  try {
// Conflict detection
const isConflict = await g.V(doctorList[0].id)
  .inE('hasAppointment')
  .has('date', date)
  .has('time', time)
  .toList();

if (isConflict.length > 0) {
  // Find alternative doctors with the same specialty but exclude the conflicting doctor
  const fallbackDoctors = allDoctors.filter(d => 
    d.specialty && 
    d.specialty[0].toLowerCase() === serviceNeeded.trim().toLowerCase() &&
    d.name[0].toLowerCase() !== normalizedDoctor
  );

  if (fallbackDoctors.length > 0) {
    const fallbackNames = fallbackDoctors.map(d => d.name[0]);
    return res.status(409).json({
      error: `Doctor '${doctorName}' is already booked at this time. Suggested alternative doctors for '${serviceNeeded}':`,
      alternatives: fallbackNames
    });
  } else {
    return res.status(409).json({
      error: `Doctor '${doctorName}' is already booked at this time, and no alternative doctors found for '${serviceNeeded}'.`
    });
  }
}

  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch appointments', details: err.message });
  }
});

/** ---------------------- POST Queries ---------------------- **/

router.post('/appointments', async (req, res) => {
  try {
    const g = getTraversal();
    const { patientName, doctorName, serviceNeeded, date, time, location } = req.body;

    if (!patientName || !doctorName || !serviceNeeded || !date || !time) {
      return res.status(400).json({ error: 'All fields (patientName, doctorName, serviceNeeded, date, time) are required.' });
    }

    const __ = gremlin.process.statics;

    const allPatients = await g.V().hasLabel('patient').valueMap(true).toList();
    const allDoctors = await g.V().hasLabel('doctor').valueMap(true).toList();

    const normalizedPatient = patientName.trim().toLowerCase();
    const normalizedDoctor = doctorName.trim().toLowerCase();
    const normalizedService = serviceNeeded.trim().toLowerCase();

    const patientList = allPatients.filter(p => p.name && p.name[0].toLowerCase() === normalizedPatient);
    const doctorList = allDoctors.filter(d => d.name && d.name[0].toLowerCase() === normalizedDoctor);

    if (patientList.length === 0) {
      return res.status(404).json({ error: `Patient '${patientName}' not found.` });
    }

    if (doctorList.length === 0) {
      const fallbackDoctors = allDoctors.filter(d =>
        d.specialty && d.specialty[0].toLowerCase().includes(normalizedService)
      );

      if (fallbackDoctors.length === 0) {
        return res.status(404).json({ error: `Doctor '${doctorName}' not found, and no fallback doctor found for service '${serviceNeeded}'.` });
      }

      return res.status(404).json({
        error: `Doctor '${doctorName}' not found. Suggested doctors for '${serviceNeeded}':`,
        suggestions: fallbackDoctors.map(d => d.name[0])
      });
    }

    const patient = patientList[0];
    const doctor = doctorList[0];

    // Check if the doctor is already booked at this date and time
    const existingAppointments = await g.V(doctor.id)
      .inE('hasAppointment')
      .has('date', date)
      .has('time', time)
      .toList();

    if (existingAppointments.length > 0) {
      // Find alternative doctors with matching specialty
      const alternativeDoctors = allDoctors.filter(d =>
        d.id !== doctor.id &&
        d.specialty && d.specialty[0].toLowerCase().includes(normalizedService)
      );

      if (alternativeDoctors.length === 0) {
        return res.status(409).json({ error: `Doctor '${doctorName}' is already booked at this time, and no alternative doctors found for '${serviceNeeded}'.` });
      }

      return res.status(409).json({
        error: `Doctor '${doctorName}' is already booked at this time. Suggested alternative doctors for '${serviceNeeded}':`,
        suggestions: alternativeDoctors.map(d => d.name[0])
      });
    }

    // Create the appointment
    const result = await g.V(patient.id)
      .addE('hasAppointment')
      .to(__.V(doctor.id))
      .property('date', date)
      .property('time', time)
      .property('location', location || '')
      .property('serviceNeeded', serviceNeeded)
      .next();

    res.status(201).json({ message: 'Appointment created successfully.', edge: result.value });
  } catch (err) {
    console.error('Insert appointment error:', err);
    res.status(500).json({ error: 'Failed to create appointment.', details: err.message });
  }
});


/** ---------------------- DROP / DELETE Queries ---------------------- **/

router.get('/reset-patients', async (req, res) => {
  try { const g = getTraversal(); await g.V().hasLabel('patient').drop().iterate(); res.send('All patient nodes deleted.'); } 
  catch (err) { res.status(500).send('Failed to reset patients.'); }
});

router.get('/reset-doctors', async (req, res) => {
  try { const g = getTraversal(); await g.V().hasLabel('doctor').drop().iterate(); res.send('All doctor nodes deleted.'); }
  catch (err) { res.status(500).send('Failed to reset doctors.'); }
});

router.get('/reset-appointments', async (req, res) => {
  try { const g = getTraversal(); await g.E().hasLabel('hasAppointment').drop().iterate(); res.send('All appointment edges deleted.'); }
  catch (err) { res.status(500).send('Failed to reset appointments.'); }
});

router.get('/reset-all', async (req, res) => {
  try { const g = getTraversal(); await g.V().drop().iterate(); res.send('All vertices deleted.'); }
  catch (err) { res.status(500).send('Failed to reset graph.'); }
});

router.delete('/appointments/:appointmentId', async (req, res) => {
  const { appointmentId } = req.params;
  if (!appointmentId) return res.status(400).json({ error: 'Appointment ID is required' });

  try {
    const g = getTraversal();
    await g.E(appointmentId).drop().iterate();
    res.status(200).json({ message: `Appointment ${appointmentId} deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete appointment.', details: err.message });
  }
});
