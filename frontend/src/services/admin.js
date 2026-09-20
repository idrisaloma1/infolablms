import api from './api';

export async function fetchAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function fetchAdminStudents() {
  const { data } = await api.get('/admin/students');
  return data.students;
}

export async function fetchAdminStudentDetail(studentId) {
  const { data } = await api.get(`/admin/students/${studentId}`);
  return data;
}

export async function fetchAdminEnrollments(status) {
  const { data } = await api.get('/admin/enrollments', { params: status ? { status } : {} });
  return data.enrollments;
}

export async function updateEnrollmentStatus(enrollmentId, status) {
  const { data } = await api.patch(`/admin/enrollments/${enrollmentId}`, { status });
  return data.enrollment;
}
