import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-api-gateway-url',
});

export const scheduleAppointment = async (appointmentData) => {
  const response = await api.post('/appointments', appointmentData);
  return response.data;
};

export default {
  scheduleAppointment,
};
