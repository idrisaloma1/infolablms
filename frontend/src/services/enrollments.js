import api from './api';

export async function enrollInCourse(courseId) {
  const { data } = await api.post('/enrollments', { courseId });
  return data.enrollment;
}

export async function fetchMyEnrollments() {
  const { data } = await api.get('/enrollments');
  return data.enrollments;
}
