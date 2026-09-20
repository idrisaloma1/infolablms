import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchMyEnrollments } from '../../services/enrollments';
import { fetchCurriculum, markLessonComplete } from '../../services/learning';
import { fetchMyCertificates, generateCertificate } from '../../services/certificates';

function LoadingState() {
  return <p className="text-center text-gray-400 py-12">Loading...</p>;
}

function ErrorState({ message }) {
  return <p className="text-center text-red-500 py-12">{message}</p>;
}

export function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyEnrollments()
      .then(setEnrollments)
      .catch(() => setError('Could not load your courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-section">
      <div className="container-lg">
        <h1 className="section-title">My Dashboard</h1>
        <p className="section-subtitle">Pick up where you left off.</p>

        <div className="mt-10">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}

          {!loading && !error && enrollments.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-gray-500 mb-4">You're not enrolled in any courses yet.</p>
              <Link to="/courses" className="btn-primary">Browse Courses</Link>
            </div>
          )}

          {!loading && !error && enrollments.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((e) => (
                <div key={e.id} className="card p-6 flex flex-col">
                  <h3 className="font-heading font-bold text-lg text-navy-900">{e.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex-grow">{e.short_description}</p>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{e.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${e.progress || 0}%` }} />
                    </div>
                  </div>

                  <Link to={`/student/learn/${e.course_id}`} className="btn-primary w-full mt-5">
                    {e.progress >= 100 ? 'Review Course' : e.progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StudentCourses() {
  return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-navy-900">My Courses</h1></div>;
}

export function StudentLearn() {
  const { id: courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [marking, setMarking] = useState(false);

  const [certGenerating, setCertGenerating] = useState(false);
  const [certResult, setCertResult] = useState(null);
  const [certMessage, setCertMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchCurriculum(courseId)
      .then((res) => {
        setData(res);
        const flat = res.modules.flatMap((m) => m.lessons);
        const firstUnlocked = flat.find((l) => l.unlocked) || flat[0];
        if (firstUnlocked) setActiveLessonId(firstUnlocked.id);
      })
      .catch(() => setError('Could not load this course.'))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error || 'Course not found.'} />;

  const flatLessons = data.modules.flatMap((m) => m.lessons);
  const activeLesson = flatLessons.find((l) => l.id === activeLessonId);
  const activeIndex = flatLessons.findIndex((l) => l.id === activeLessonId);
  const nextLesson = flatLessons[activeIndex + 1];

  async function handleCompleteAndContinue() {
    if (!activeLesson) return;
    setMarking(true);
    try {
      const result = await markLessonComplete(activeLesson.id);
      setData((prev) => ({
        ...prev,
        completedCount: result.completed,
        progressPercent: result.progressPercent,
        modules: prev.modules.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === activeLesson.id ? { ...l, completed: true } : l
          ),
        })),
      }));
      if (nextLesson) setActiveLessonId(nextLesson.id);
    } catch {
      // silent fail for now
    } finally {
      setMarking(false);
    }
  }

  async function handleGenerateCertificate() {
    setCertGenerating(true);
    setCertResult(null);
    setCertMessage('');
    try {
      const cert = await generateCertificate(courseId);
      setCertResult('success');
      setCertMessage(`Certificate issued: ${cert.certificate_no}`);
    } catch (err) {
      setCertResult('error');
      setCertMessage(err.response?.data?.error || 'Could not generate certificate.');
    } finally {
      setCertGenerating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      <aside className="w-full lg:w-80 border-r border-gray-100 bg-white lg:min-h-screen">
        <div className="p-4 border-b border-gray-100">
          <Link to="/student/dashboard" className="text-sm text-gray-500 hover:text-brand-accent">
            ← Back to Dashboard
          </Link>
        </div>
        <div className="p-4">
          {data.modules.map((mod) => (
            <div key={mod.id} className="mb-5">
              <h4 className="font-heading font-semibold text-sm text-navy-900 mb-2">{mod.title}</h4>
              <div className="space-y-1">
                {mod.lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => lesson.unlocked && setActiveLessonId(lesson.id)}
                    disabled={!lesson.unlocked}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      lesson.id === activeLessonId
                        ? 'bg-green-50 text-green-800 font-semibold'
                        : lesson.unlocked
                        ? 'text-gray-600 hover:bg-gray-50'
                        : 'text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    <span>{lesson.completed ? '✅' : lesson.unlocked ? '▶️' : '🔒'}</span>
                    <span className="flex-grow">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-grow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-400">
              {data.completedCount} of {data.totalLessons} lessons complete
            </p>
            <div className="progress-bar w-48 mt-1">
              <div className="progress-fill" style={{ width: `${data.progressPercent}%` }} />
            </div>
          </div>
        </div>

        {data.progressPercent >= 100 && (
          <div className="card p-6 mb-6 bg-green-50 border-green-100">
            <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">
              🎉 Course Complete!
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You've finished all lessons. Generate your certificate below.
            </p>
            <button
              onClick={handleGenerateCertificate}
              disabled={certGenerating}
              className="btn-primary"
            >
              {certGenerating ? 'Generating...' : 'Generate Certificate'}
            </button>
            {certResult && (
              <div
                className={`mt-3 text-sm rounded-lg px-4 py-2.5 ${
                  certResult === 'error'
                    ? 'text-red-600 bg-red-50 border border-red-100'
                    : 'text-green-700 bg-white border border-green-200'
                }`}
              >
                {certMessage}
                {certResult === 'success' && (
                  <>
                    {' '}
                    <Link to="/student/certificates" className="font-semibold hover:underline">
                      View your certificates →
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {!activeLesson ? (
          <p className="text-gray-400">No lessons available yet.</p>
        ) : !activeLesson.unlocked ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">🔒 This lesson is locked. Enroll in this course to unlock it.</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-heading font-bold text-navy-900 mb-4">{activeLesson.title}</h1>

            <div className="bg-black rounded-xl aspect-video flex items-center justify-center mb-6">
              <video
                key={activeLesson.id}
                controls
                className="w-full h-full rounded-xl"
                src={activeLesson.video_url}
              >
                Your browser does not support video playback.
              </video>
            </div>

            {activeLesson.materials.length > 0 && (
              <div className="card p-6 mb-6">
                <h2 className="font-heading font-semibold text-lg text-navy-900 mb-3">Lesson Materials</h2>
                <ul className="space-y-2">
                  {activeLesson.materials.map((m) => (
                    <li key={m.id}>
                      <a href={m.url} download className="text-brand-accent hover:underline text-sm">
                        📄 {m.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleCompleteAndContinue}
              disabled={marking || activeLesson.completed}
              className="btn-primary"
            >
              {activeLesson.completed
                ? 'Completed ✓'
                : marking
                ? 'Saving...'
                : nextLesson
                ? 'Complete and Continue →'
                : 'Mark Complete'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export function StudentProfile() {
  return <div className="min-h-screen flex items-center justify-center"><h1 className="text-2xl font-bold text-navy-900">My Profile</h1></div>;
}

export function StudentCerts() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCertificates()
      .then(setCertificates)
      .catch(() => setError('Could not load your certificates.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-section">
      <div className="container-lg">
        <h1 className="section-title">My Certificates</h1>
        <p className="section-subtitle">Certificates you've earned by completing courses.</p>

        <div className="mt-10">
          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}

          {!loading && !error && certificates.length === 0 && (
            <div className="card p-8 text-center">
              <p className="text-gray-500 mb-4">You haven't earned any certificates yet.</p>
              <Link to="/student/dashboard" className="btn-primary">Go to Dashboard</Link>
            </div>
          )}

          {!loading && !error && certificates.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certificates.map((cert) => (
                <div key={cert.id} className="card p-6">
                  <span className="badge-green">Verified</span>
                  <h3 className="font-heading font-bold text-lg text-navy-900 mt-3">
                    {cert.course_title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Certificate No: <span className="font-mono">{cert.certificate_no}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Issued {new Date(cert.issued_at).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/verify/${cert.certificate_no}`}
                    className="btn-secondary w-full mt-4"
                  >
                    View / Verify
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
