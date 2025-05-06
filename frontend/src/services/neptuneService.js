const AWS = require('aws-sdk');
const neptune = new AWS.Neptune();

exports.scheduleAppointment = async (patientId, doctorId, appointmentTime) => {
  // Logic to interact with Neptune and create appointment
  const query = `
    MATCH (p:Patient {id: $patientId}), (d:Doctor {id: $doctorId})
    CREATE (p)-[:HAS_APPOINTMENT {time: $appointmentTime}]->(d)
    RETURN p, d
  `;
  const params = {
    query,
    parameters: {
      patientId,
      doctorId,
      appointmentTime,
    },
  };
  const result = await neptune.executeStatement(params).promise();
  return result;
};
