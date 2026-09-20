import { useEffect, useState } from 'react';
import {
  fetchAdminStats,
  fetchAdminStudents,
  fetchAdminEnrollments,
  updateEnrollmentStatus,
} from '../../services/admin';
import { formatNaira } from '../../services/courses';

function LoadingState() {
  return <p className="text-center text-gray-400 py-12">Loading...</p>;
}

function ErrorState({ message }) {
  return <p className="text-center text-red-500 py-12">{message}</p>;
}

// ── DASHBOARD ──────────────────────────────────────────────

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStats()
      .then(setStats)
      .catch(() => setError('Could not load stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error || !stats) return <ErrorState message={error} />;

  const studentCount = stats.usersByRole.find((r) => r.role === 'student')?.count || 0;
  const activeEnrollments = stats.enrollmentsByStatus.find((s) => s.status === 'active')?.count || 0;
  const completedEnrollments = stats.enrollmentsByStatus.find((s) => s.status === 'completed')?.count || 0;

  const cards = [
    { label: 'Total Students', value: studentCount, icon: '👥' },
    { label: 'Published Courses', value: `${stats.courses.published} / ${stats.courses.total}`, icon: '📚' },
    { label: 'Active Enrollments', value: activeEnrollments, icon: '📝' },
    { label: 'Completed', value: completedEnrollments, icon: '✅' },
    { label: 'Certificates Issued', value: stats.certificatesIssued, icon: '🎓' },
    { label: 'Estimated Revenue', value: formatNaira(stats.estimatedRevenue), icon: '💰' },
  ];

  return (
    <div>
      <h1 className="section-title text-2xl">Admin Dashboard</h1>
      <p className="text-gray-500 mt-2">Overview of INFOLAB LMS activity.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {cards.map((c) => (
          <div key={c.label} className="card p-6">
            <div className="text-2xl mb-2">{c.icon}</div>
            <p className="text-2xl font-bold text-navy-900">{c.value}</p>
            <p className="text-sm text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── STUDENTS ───────────────────────────────────────────────

export function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminStudents()
      .then(setStudents)
      .catch(() => setError('Could not load students.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <h1 className="section-title text-2xl">Students</h1>
      <p className="text-gray-500 mt-2">{students.length} registered students.</p>

      <div className="table-wrapper mt-6">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Enrollments</th>
              <th>Joined</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="font-medium text-navy-900">{s.name}</td>
                <td>{s.email}</td>
                <td>{s.enrollment_count}</td>
                <td>{new Date(s.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={s.is_active ? 'badge-green' : 'badge-gray'}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminCourses() {
  return <h1 className="section-title text-2xl">Courses</h1>;
}

export function AdminCreateCourse() {
  return <h1 className="section-title text-2xl">Create Course</h1>;
}

// ── ENROLLMENTS ────────────────────────────────────────────

export function AdminEnrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchAdminEnrollments(filter)
      .then(setEnrollments)
      .catch(() => setError('Could not load enrollments.'))
      .finally(() => setLoading(false));
  }, [filter]);

  async function handleStatusChange(enrollmentId, newStatus) {
    setUpdatingId(enrollmentId);
    try {
      await updateEnrollmentStatus(enrollmentId, newStatus);
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: newStatus } : e))
      );
    } catch {
      // silent fail for now
    } finally {
      setUpdatingId(null);
    }
  }

  const statusOptions = ['pending', 'active', 'completed', 'cancelled', 'suspended'];

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="section-title text-2xl">Enrollments</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input w-auto"
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="table-wrapper mt-6">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Course</th>
                <th>Progress</th>
                <th>Enrolled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="font-medium text-navy-900">{e.student_name}</div>
                    <div className="text-xs text-gray-400">{e.student_email}</div>
                  </td>
                  <td>{e.course_title}</td>
                  <td>{e.progress}%</td>
                  <td>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                  <td>
                    <select
                      value={e.status}
                      disabled={updatingId === e.id}
                      onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                      className="input w-auto py-1.5 text-xs"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AdminPayments() {
  return <h1 className="section-title text-2xl">Payments</h1>;
}

export function AdminCertificates() {
  return <h1 className="section-title text-2xl">Certificates</h1>;
}

export function AdminSettings() {
  return <h1 className="section-title text-2xl">Settings</h1>;
}

export function AdminAnnouncements() {
  return <h1 className="section-title text-2xl">Announcements</h1>;
}
