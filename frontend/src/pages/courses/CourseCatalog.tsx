import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface Course {
  id: string;
  code: string;
  name: string;
  period: string;
  professors?: Array<{ name: string }>;
  _count?: {
    students: number;
    challenges: number;
  };
}

export const CourseCatalog: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourses();
    fetchEnrolled();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load courses');
      setLoading(false);
    }
  };

  const fetchEnrolled = async () => {
    try {
      if (user?.id) {
        const my = await coursesApi.getMine();
        setEnrolled(new Set(my.data.map((c: any) => c.id)));
      }
    } catch {}
  };

  const handleEnroll = async (courseId: string) => {
    if (!user?.id) {
      setError('You must be logged in to enroll');
      return;
    }

    setEnrolling(courseId);
    setError(null);
    setSuccess(null);

    try {
      await coursesApi.selfEnroll(courseId);
      setSuccess('Successfully enrolled in course!');
      setEnrolled((prev) => new Set(prev).add(courseId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrolling(null);
    }
  };

  const handleUnenroll = async (courseId: string) => {
    setEnrolling(courseId);
    setError(null);
    setSuccess(null);

    try {
      await coursesApi.selfUnenroll(courseId);
      setSuccess('Successfully unenrolled from course!');
      setEnrolled((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unenroll from course');
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-gray-600 mt-2">Browse and enroll in available courses</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {courses.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          No courses available yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="bg-indigo-600 text-white px-6 py-4">
                <h2 className="text-xl font-bold">{course.name}</h2>
                <p className="text-indigo-100 text-sm mt-1">Code: {course.code}</p>
              </div>
              
              <div className="px-6 py-4">
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-semibold">Period:</span> {course.period}
                  </p>
                  
                  {course.professors && course.professors.length > 0 && (
                    <p className="text-gray-600 text-sm mb-2">
                      <span className="font-semibold">Professor(s):</span>{' '}
                      {course.professors.map(p => p.name).join(', ')}
                    </p>
                  )}
                  
                  <div className="flex gap-4 text-sm text-gray-500 mt-3">
                    {course._count && (
                      <>
                        <span>👥 {course._count.students} students</span>
                        <span>📝 {course._count.challenges} challenges</span>
                      </>
                    )}
                  </div>
                </div>

                {enrolled.has(course.id) ? (
                  <div className="space-y-2">
                    <a
                      href={`/courses/${course.id}`}
                      className="block w-full py-2 px-4 rounded-md font-medium text-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                    >
                      Open Course
                    </a>
                    <button
                      onClick={() => handleUnenroll(course.id)}
                      disabled={enrolling === course.id}
                      className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                        enrolling === course.id
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {enrolling === course.id ? 'Unenrolling...' : 'Unenroll'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEnroll(course.id)}
                    disabled={enrolling === course.id}
                    className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                      enrolling === course.id
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {enrolling === course.id ? 'Enrolling...' : 'Enroll in Course'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
