import api from './api';

export async function fetchMyCertificates() {
  const { data } = await api.get('/certificates');
  return data.certificates;
}

export async function generateCertificate(courseId) {
  const { data } = await api.post('/certificates/generate', { courseId });
  return data.certificate;
}

export async function verifyCertificate(certificateNo) {
  const { data } = await api.get(`/certificates/verify/${certificateNo}`);
  return data;
}
