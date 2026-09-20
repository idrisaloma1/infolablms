import api from './api';

export async function fetchCourses({ featured, category } = {}) {
  const params = {};
  if (featured) params.featured = 'true';
  if (category) params.category = category;

  const { data } = await api.get('/courses', { params });
  return data.courses;
}

export async function fetchCourseBySlug(slug) {
  const { data } = await api.get(`/courses/${slug}`);
  return data.course;
}

export function formatNaira(amount) {
  const num = Number(amount);
  if (Number.isNaN(num)) return amount;
  return `₦${num.toLocaleString('en-NG')}`;
}
