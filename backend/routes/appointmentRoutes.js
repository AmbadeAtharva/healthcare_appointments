router.post('/appointments', async (req, res) => {
    try {
      const g = getTraversal();
      const { patientName, doctorName, date, time, location, serviceType } = req.body;
  
      if (!patientName || !doctorName || !date || !time || !serviceType) {
        return res.status(400).json({ error: 'All fields (patientName, doctorName, date, time, serviceType) are required.' });
      }
  
      const __ = gremlin.process.statics;
  
      const allPatients = await g.V().hasLabel('patient').valueMap(true).toList();
      const allDoctors = await g.V().hasLabel('doctor').valueMap(true).toList();
  
      const normalizedPatient = patientName.trim().toLowerCase();
      const normalizedDoctor = doctorName.trim().toLowerCase();
      const normalizedService = serviceType.trim().toLowerCase();
  
      const patientList = allPatients.filter(p => p.name && p.name[0].toLowerCase() === normalizedPatient);
      let doctorList = allDoctors.filter(d => d.name && d.name[0].toLowerCase() === normalizedDoctor);
  
      if (doctorList.length === 0) {
        return res.status(404).json({ error: `Doctor ${doctorName} not found.` });
      }
  
      const primaryDoctor = doctorList[0];
      const specialty = primaryDoctor.specialty ? primaryDoctor.specialty[0].toLowerCase() : '';
  
      if (specialty !== normalizedService) {
        // Fallback specialty mapping
        const specialtyFallbacks = {
          "pediatric": ["general physician", "family medicine"],
          "orthopedics": ["general physician"],
          "cardiology": ["general physician"],
          "dermatology": ["general physician"]
        };
  
        const fallbackSpecialties = specialtyFallbacks[normalizedService] || [];
        const fallbackDoctor = allDoctors.find(d => 
          fallbackSpecialties.includes((d.specialty && d.specialty[0].toLowerCase()) || '')
        );
  
        if (fallbackDoctor) {
          doctorList = [fallbackDoctor];  // Use fallback doctor
        } else {
          return res.status(404).json({ 
            error: `No doctors available for the requested service: ${serviceType}`,
            fallbackChecked: fallbackSpecialties
          });
        }
      }
  
      if (patientList.length === 0) {
        return res.status(404).json({ error: `Patient ${patientName} not found.` });
      }
  
      const result = await g.V(patientList[0].id)
        .addE('hasAppointment')
        .to(__.V(doctorList[0].id))
        .property('date', date)
        .property('time', time)
        .property('location', location || '')
        .property('serviceType', serviceType) // Record service requested
        .next();
  
      res.status(201).json({ message: 'Appointment created successfully.', edge: result.value });
  
    } catch (err) {
      console.error('Insert appointment error:', err);
      res.status(500).json({ error: 'Failed to create appointment.', details: err.message });
    }
  });
  