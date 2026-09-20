import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './routes/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import PublicLayout from './components/layout/PublicLayout';
import { HomePage, AboutPage, CoursesPage, CourseDetailPage, ContactPage, VerifyCertPage, NotFoundPage } from './pages/public/index';
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/auth/index';
import { StudentDashboard, StudentCourses, StudentLearn, StudentProfile, StudentCerts } from './pages/student/index';
import { AdminDashboard, AdminStudents, AdminCourses, AdminCreateCourse, AdminEnrollments, AdminPayments, AdminCertificates, AdminSettings, AdminAnnouncements } from './pages/admin/index';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/courses" element={<PublicLayout><CoursesPage /></PublicLayout>} />
        <Route path="/courses/:slug" element={<PublicLayout><CourseDetailPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/verify/:id" element={<PublicLayout><VerifyCertPage /></PublicLayout>} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/courses" element={<ProtectedRoute><StudentCourses /></ProtectedRoute>} />
        <Route path="/student/learn/:id" element={<ProtectedRoute><StudentLearn /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute><StudentProfile /></ProtectedRoute>} />
        <Route path="/student/certificates" element={<ProtectedRoute><StudentCerts /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
        <Route path="/admin/students" element={<AdminRoute><AdminLayout><AdminStudents /></AdminLayout></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><AdminLayout><AdminCourses /></AdminLayout></AdminRoute>} />
        <Route path="/admin/courses/create" element={<AdminRoute><AdminLayout><AdminCreateCourse /></AdminLayout></AdminRoute>} />
        <Route path="/admin/enrollments" element={<AdminRoute><AdminLayout><AdminEnrollments /></AdminLayout></AdminRoute>} />
        <Route path="/admin/payments" element={<AdminRoute><AdminLayout><AdminPayments /></AdminLayout></AdminRoute>} />
        <Route path="/admin/certificates" element={<AdminRoute><AdminLayout><AdminCertificates /></AdminLayout></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
        <Route path="/admin/announcements" element={<AdminRoute><AdminLayout><AdminAnnouncements /></AdminLayout></AdminRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
