import { useEffect, useState } from 'react';
import infolabIcon from '../../assets/infolab-icon.jpg';
import signatureImg from '../../assets/signature.jpeg';
import { Link, useParams } from 'react-router-dom';
import { fetchCourses, fetchCourseBySlug, formatNaira } from '../../services/courses';
import { enrollInCourse } from '../../services/enrollments';
import { verifyCertificate } from '../../services/certificates';
import { useAuth } from '../../context/AuthContext';

const features = [
  {
    title: 'Expert Instructors',
    description: 'Learn directly from experienced engineers and industry practitioners.',
  },
  {
    title: 'Hands-On Projects',
    description: 'Every course includes practical labs and real-world projects, not just theory.',
  },
  {
    title: 'Industry-Recognized Skills',
    description: 'Curricula aligned with real certification tracks like AWS and ISC2.',
  },
  {
    title: 'Built for Nigerian Institutions',
    description: 'Training designed specifically for schools and organizations across Nigeria.',
  },
];

function CourseCard({ course }) {
  return (
    <div className="card-hover p-6 flex flex-col">
      <span className="badge-blue self-start">{course.category_name || 'Course'}</span>
      <h3 className="font-heading font-bold text-xl text-navy-900 mt-4">{course.title}</h3>
      <p className="text-sm text-gray-500 mt-2 flex-grow">
        {course.short_description || course.description}
      </p>
      <div className="flex items-center justify-end mt-5 pt-5 border-t border-gray-100">
        <div className="text-right">
          <p className="text-xs text-gray-400">Price</p>
          <p className="text-sm font-bold text-brand-accent">{formatNaira(course.price)}</p>
        </div>
      </div>
      <Link to={`/courses/${course.slug}`} className="btn-primary w-full mt-5">
        View Course
      </Link>
    </div>
  );
}

function LoadingState() {
  return <p className="text-center text-gray-400 py-12">Loading courses...</p>;
}

function ErrorState({ message }) {
  return <p className="text-center text-red-500 py-12">{message}</p>;
}

export function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses({ featured: true })
      .then(setFeaturedCourses)
      .catch(() => setError('Could not load featured courses.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="hero-gradient text-white">
        <div className="container-lg page-section text-center">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold max-w-3xl mx-auto leading-tight">
            Practical Tech Training for Schools & Institutions
          </h1>
          <p className="text-lg text-gray-200 mt-5 max-w-2xl mx-auto">
            INFOLAB LMS delivers hands-on courses in cloud computing, web development,
            and cybersecurity — built for Nigerian learners, taught by industry practitioners.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/courses" className="btn-primary btn-lg">Explore Courses</Link>
            <Link to="/register" className="btn-secondary btn-lg">Get Started</Link>
          </div>
        </div>
      </section>

      <section className="page-section">
        <div className="container-lg">
          <h2 className="section-title text-center">Why Learn With Us</h2>
          <p className="section-subtitle text-center mx-auto">
            A learning experience built around real skills, not just certificates.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {features.map((f) => (
              <div key={f.title} className="card p-6">
                <h3 className="font-heading font-semibold text-lg text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="page-section bg-white">
        <div className="container-lg">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h2 className="section-title">Featured Courses</h2>
              <p className="section-subtitle">Start with one of our most popular training programs.</p>
            </div>
            <Link to="/courses" className="text-brand-accent font-semibold hover:underline whitespace-nowrap">
              View all courses →
            </Link>
          </div>

          {loading && <LoadingState />}
          {error && <ErrorState message={error} />}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {featuredCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="page-section bg-navy-900 text-white text-center">
        <div className="container-md">
          <h2 className="text-3xl font-heading font-bold">Ready to start learning?</h2>
          <p className="text-gray-300 mt-3 max-w-xl mx-auto">
            Join a training program built for real careers in tech.
          </p>
          <Link to="/register" className="btn-primary btn-lg mt-6 inline-flex">
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}

export function AboutPage() {
  return (
    <div className="page-section">
      <div className="container-md">
        <div className="text-center mb-12">
          <h1 className="section-title">About INFOLAB LMS</h1>
          <p className="section-subtitle mx-auto">
            Practical tech education, built in Lagos, for learners across Nigeria.
          </p>
        </div>
        <div className="card p-8 space-y-6">
          <div>
            <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">Our Story</h2>
            <p className="text-gray-600 leading-relaxed">
              Infolab Technology Services (IIT) is a Lagos-based EduTech and software
              development company dedicated to closing the gap between classroom learning
              and real-world tech careers. We build software for schools and institutions
              across Nigeria, and we train the next generation of developers, cloud
              engineers, and cybersecurity professionals to build it.
            </p>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              To make industry-grade tech training accessible to Nigerian students and
              professionals — through hands-on courses in cloud computing, web development,
              cybersecurity, data analysis, and beyond, taught by practitioners who build
              these systems every day.
            </p>
          </div>
          <div>
            <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">Who We Serve</h2>
            <p className="text-gray-600 leading-relaxed">
              We work directly with Nigerian schools and institutions, and we run training
              cohorts for individuals looking to build real, certifiable skills in today's
              most in-demand tech fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(() => setError('Could not load courses. Please try again later.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-section">
      <div className="container-lg">
        <div className="text-center mb-12">
          <h1 className="section-title">All Courses</h1>
          <p className="section-subtitle mx-auto">
            Browse our full catalog of hands-on tech training programs.
          </p>
        </div>

        {loading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.slug} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CourseDetailPage() {
  const { slug } = useParams();
  const { isLoggedIn } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null);
  const [enrollMessage, setEnrollMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchCourseBySlug(slug)
      .then(setCourse)
      .catch(() => setError('not-found'))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleBuyClick() {
    if (!course) return;
    setEnrolling(true);
    setEnrollResult(null);
    setEnrollMessage('');
    try {
      await enrollInCourse(course.id);
      setEnrollResult('success');
      setEnrollMessage('You are now enrolled in this course!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Enrollment failed. Please try again.';
      if (msg.toLowerCase().includes('already enrolled')) {
        setEnrollResult('already');
        setEnrollMessage('You are already enrolled in this course.');
      } else {
        setEnrollResult('error');
        setEnrollMessage(msg);
      }
    } finally {
      setEnrolling(false);
    }
  }

  if (loading) return <LoadingState />;

  if (error || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-navy-900">Course not found</h1>
        <Link to="/courses" className="text-brand-accent hover:underline">Back to Courses</Link>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="container-md">
        <span className="badge-blue">{course.category_name || 'Course'}</span>
        <h1 className="text-3xl lg:text-4xl font-heading font-bold text-navy-900 mt-4">
          {course.title}
        </h1>

        <div className="card p-6 mt-8">
          <h2 className="font-heading font-semibold text-lg text-navy-900 mb-3">About This Course</h2>
          <p className="text-gray-600 leading-relaxed">{course.description}</p>
        </div>

        <div className="mt-8 p-6 card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">Price</p>
              <p className="text-2xl font-bold text-brand-accent">{formatNaira(course.price)}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href={`/course-outlines/${course.slug}.pdf`} download className="btn-secondary">
                Download Course Content (PDF)
              </a>
              {isLoggedIn ? (
                <button
                  onClick={handleBuyClick}
                  disabled={enrolling || enrollResult === 'success' || enrollResult === 'already'}
                  className="btn-primary"
                >
                  {enrolling ? 'Enrolling...' : 'Buy This Course'}
                </button>
              ) : (
                <Link to="/register" className="btn-primary">Buy This Course</Link>
              )}
            </div>
          </div>

          {enrollResult && (
            <div
              className={`mt-4 text-sm rounded-lg px-4 py-2.5 ${
                enrollResult === 'error'
                  ? 'text-red-600 bg-red-50 border border-red-100'
                  : 'text-green-700 bg-green-50 border border-green-100'
              }`}
            >
              {enrollMessage}
              {(enrollResult === 'success' || enrollResult === 'already') && (
                <>
                  {' '}
                  <Link to="/student/dashboard" className="font-semibold hover:underline">
                    Go to your dashboard →
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="page-section">
      <div className="container-md">
        <div className="text-center mb-12">
          <h1 className="section-title">Contact Us</h1>
          <p className="section-subtitle mx-auto">Please fill the form below to reach us</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-8 space-y-6">
            <div>
              <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">Address</h2>
              <p className="text-gray-600 leading-relaxed">
                22, Oluwaniyi Street, off Anjorin AIT, off Amikanle Road, Alagbado, Lagos
              </p>
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">Email</h2>
              <a href="mailto:infolabinstitute@gmail.com" className="text-brand-accent hover:underline">
                infolabinstitute@gmail.com
              </a>
            </div>
            <div>
              <h2 className="font-heading font-semibold text-lg text-navy-900 mb-2">Phone</h2>
              <div className="space-y-1">
                <a href="tel:08072889844" className="block text-gray-600 hover:text-brand-accent">0807 288 9844</a>
                <a href="tel:08037945608" className="block text-gray-600 hover:text-brand-accent">0803 794 5608</a>
                <a href="tel:09039630679" className="block text-gray-600 hover:text-brand-accent">0903 963 0679</a>
              </div>
            </div>
          </div>

          <div className="bg-navy-50 rounded-2xl p-8">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Name</label>
                <input
                  type="text"
                  className="w-full px-5 py-3 rounded-full border-none bg-white shadow-sm text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-5 py-3 rounded-full border-none bg-white shadow-sm text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Mobile</label>
                <input
                  type="tel"
                  className="w-full px-5 py-3 rounded-full border-none bg-white shadow-sm text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  placeholder="080X XXX XXXX"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-navy-900 mb-2">Message</label>
                <textarea
                  rows="4"
                  className="w-full px-5 py-3 rounded-2xl border-none bg-white shadow-sm text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  placeholder="How can we help?"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-primary w-full">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerifyCertPage() {
  const { id: certificateNo } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('not-found');

  useEffect(() => {
    verifyCertificate(certificateNo)
      .then(setResult)
      .catch(() => setError('not-found'))
      .finally(() => setLoading(false));
  }, [certificateNo]);

  if (loading) return <LoadingState />;

  const notFound = error && !result?.certificate;
  const cert = result?.certificate;

  return (
    <div className="page-section flex items-center justify-center min-h-[70vh] print:min-h-0 print:py-0">
      <div className="container-md w-full max-w-3xl">
        {notFound ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-heading font-bold text-navy-900">Certificate Not Found</h1>
            <p className="text-gray-500 mt-2">
              We could not find a certificate with this number. Please check and try again.
            </p>
          </div>
        ) : !result.valid ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-heading font-bold text-navy-900">Certificate Revoked</h1>
            <p className="text-gray-500 mt-2">This certificate is no longer valid.</p>
          </div>
        ) : (
          <>
            <div className="border-4 border-navy-900 rounded-2xl p-10 sm:p-14 bg-white text-center print:border-2 print:shadow-none">
              <div className="flex justify-center mb-4">
                <img src={infolabIcon} alt="INFOLAB" className="w-16 h-16 object-contain" />
              </div>
              <h1 className="text-3xl font-heading font-bold text-navy-900">Certificate of Completion</h1>
              <p className="text-gray-500 mt-6 italic">This is to certify that</p>
              <p className="text-2xl font-heading font-bold text-brand-accent mt-2">{cert.student_name}</p>
              <p className="text-gray-500 mt-4 italic">has completed the course</p>
              <p className="text-xl font-semibold text-navy-900 mt-2">{cert.course_title}</p>
              <p className="text-sm text-gray-500 mt-6">
                Completed Date: {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <div className="flex items-end justify-between mt-10 pt-4">
                <div className="text-left">
                  <img src={signatureImg} alt="Signature" className="h-12 object-contain mb-1" />
                  <p className="border-t border-gray-400 pt-1 text-sm text-gray-600">Infolab Technology Services</p>
                  <p className="text-xs text-gray-400">Signature</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Certificate No: <span className="font-mono">{cert.certificate_no}</span></p>
                  <p>Issued On: {new Date(cert.issued_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-6 print:hidden">
              <button onClick={() => window.print()} className="btn-primary">
                Print / Save as PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-blue-600">404</h1>
      <p className="text-xl text-gray-500">Page not found</p>
      <a href="/" className="btn-primary">Go Home</a>
    </div>
  );
}
