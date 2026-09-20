import api from './api';

export async function fetchCurriculum(courseId) {
  const { data } = await api.get(`/lessons/course/${courseId}`);
  return data;
}

export async function markLessonComplete(lessonId) {
  const { data } = await api.post('/progress', { lessonId });
  return data;
}
