import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { coursesApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import CourseLessonsManager from './CourseLessonsManager';
import CourseLearningPlatform from './CourseLearningPlatform';
import CourseChallengesManager from './CourseChallengesManager';
import CourseStatistics from './CourseStatistics';
import CloneChallengesModal from './CloneChallengesModal';

type TabType = 'overview' | 'lessons' | 'challenges' | 'students' | 'evaluations' | 'submissions' | 'statistics' | 'settings';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';
  const [course, setCourse] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [coverImage, setCoverImage] = useState<string>('https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1200&h=300&fit=crop');
  const [editingCover, setEditingCover] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
      console.log('JWT Token usado en CourseDetail:', token);
    try {
      const [courseRes, studentsRes, challengesRes, submissionsRes] = await Promise.all([
        coursesApi.getById(id!),
        coursesApi.getStudents(id!),
        coursesApi.getChallenges(id!),
        user?.role === 'STUDENT' ? coursesApi.getMySubmissions(id!) : coursesApi.getSubmissions(id!),
      ]);
      setCourse(courseRes.data);
      setStudents(studentsRes.data);
      setChallenges(challengesRes.data);
      setSubmissions(submissionsRes.data);
      setErrorDetail(null);
    } catch (err: any) {
      let message = 'Error al cargar el curso.';
      if (err?.response) {
        message += `\nCódigo: ${err.response.status}`;
        if (err.response.status === 403) {
          message += '\nNo tienes permisos para ver este curso.';
        } else if (err.response.status === 404) {
          message += '\nCurso no encontrado.';
        } else if (err.response.data?.message) {
          message += `\n${err.response.data.message}`;
        }
      } else if (err?.message) {
        message += `\n${err.message}`;
      }
      setErrorDetail(message);
      console.error(message, err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="text-xl">Loading course...</div></div>;
  if (errorDetail) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600 whitespace-pre-line">{errorDetail}</div>
      </div>
    );
  }
  if (!course) return <div className="flex items-center justify-center h-screen"><div className="text-xl">Course not found.</div></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Vertical Navbar */}
      <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b">
          <h2 className="font-bold text-lg text-gray-800 truncate">{course.name}</h2>
          <p className="text-xs text-gray-500 mt-1">{course.code}</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            📊 Overview
          </button>
          <button onClick={() => setActiveTab('lessons')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'lessons' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            📚 Lessons
          </button>
          <button onClick={() => setActiveTab('challenges')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'challenges' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            🎯 Challenges ({challenges.length})
          </button>
          <button onClick={() => setActiveTab('students')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            👥 Students ({students.length})
          </button>
          <button onClick={() => setActiveTab('evaluations')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'evaluations' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            📝 Evaluations
          </button>
          <button onClick={() => setActiveTab('submissions')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'submissions' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
            📤 Submissions
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setActiveTab('statistics')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'statistics' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                📊 Statistics
              </button>
              <button onClick={() => setActiveTab('settings')} className={`w-full text-left px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 border-r-4 border-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                ⚙️ Settings
              </button>
            </>
          )}
        </div>
        <div className="p-4 border-t">
          <Link to="/courses" className="block text-center text-sm text-gray-600 hover:text-indigo-600">← Back to Courses</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-indigo-500 to-purple-600 overflow-hidden group">
          <img src={coverImage} alt="Course cover" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end p-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{course.name}</h1>
              <p className="text-white text-opacity-90">Period: {course.period}</p>
            </div>
          </div>
          {isAdmin && (
            <button onClick={() => setEditingCover(!editingCover)} className="absolute top-4 right-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-100 transition-all opacity-0 group-hover:opacity-100">
              📷 Change Cover
            </button>
          )}
        </div>

        {editingCover && isAdmin && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="max-w-4xl mx-auto flex gap-3 items-center">
              <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Image URL" className="flex-1 border p-2 rounded" />
              <button onClick={() => setEditingCover(false)} className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Save</button>
            </div>
          </div>
        )}

        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-indigo-600">{students.length}</div>
                  <div className="text-gray-600 mt-1">Students Enrolled</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-green-600">{challenges.length}</div>
                  <div className="text-gray-600 mt-1">Challenges</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-3xl font-bold text-purple-600">{submissions.length}</div>
                  <div className="text-gray-600 mt-1">Total Submissions</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">About This Course</h2>
                <p className="text-gray-600">Welcome to {course.name}! This course covers essential programming concepts and challenges.</p>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && (
            <div className="p-6">
              {isAdmin ? (
                <CourseLessonsManager courseId={id!} />
              ) : (
                <CourseLearningPlatform courseId={id!} />
              )}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="p-6">
              {isAdmin ? (
                <CourseChallengesManager courseId={id!} />
              ) : (
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Course Challenges</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {challenges.map((challenge: any) => (
                      <Link
                        key={challenge.id}
                        to={`/challenges/${challenge.id}`}
                        className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border border-gray-200"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{challenge.description}</p>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                            challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {challenges.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-4xl mb-4">📝</div>
                      <p>No challenges assigned yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'students' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Students ({students.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.map((s: any) => (
                  <div key={s.userId} className="p-4 border rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                      {(s.user?.name || s.user?.username || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{s.user?.name || s.user?.username || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{s.user?.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'evaluations' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Evaluations</h2>
              <p className="text-gray-500">Evaluation management coming soon.</p>
            </div>
          )}

          {activeTab === 'submissions' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-4">Submissions</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-3">ID</th>
                      <th className="p-3">Challenge</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((sub: any) => (
                      <tr key={sub.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{sub.id}</td>
                        <td className="p-3">{sub.challengeId}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${sub.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-3">{sub.score ?? 0}</td>
                        <td className="p-3">{new Date(sub.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && isAdmin && (
            <div className="p-6">
              <CourseStatistics courseId={id!} />
            </div>
          )}

          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Publish Status</h2>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Course is {course.isPublished ? 'Published' : 'Unpublished'}</div>
                    <div className="text-sm text-gray-600">
                      {course.isPublished ? 'Students can enroll in this course' : 'Course is hidden from students'}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await coursesApi.publishCourse(id!, !course.isPublished);
                        alert(`Course ${!course.isPublished ? 'published' : 'unpublished'} successfully!`);
                        fetchCourse();
                      } catch (err: any) {
                        alert(err.response?.data?.message || 'Failed to update publish status');
                      }
                    }}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      course.isPublished
                        ? 'bg-gray-500 text-white hover:bg-gray-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {course.isPublished ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Clone Challenges</h2>
                <CloneChallengesModal courseId={id!} onSuccess={fetchCourse} />
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Course Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
                    <input type="text" value={course.name} className="w-full border p-2 rounded" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
                    <input type="text" value={course.code} className="w-full border p-2 rounded" disabled />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                    <input type="text" value={course.period} className="w-full border p-2 rounded" disabled />
                  </div>
                  <p className="text-sm text-gray-500">Edit course details from the Courses management page.</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-4">Manage Professors</h2>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Enter User ID of professor" 
                      className="flex-1 border p-2 rounded"
                      id="professorInput"
                    />
                    <button 
                      onClick={async () => {
                        const input = document.getElementById('professorInput') as HTMLInputElement;
                        const userId = input.value.trim();
                        if (!userId) return;
                        try {
                          await coursesApi.assignProfessor(id!, userId);
                          input.value = '';
                          alert('Professor assigned successfully!');
                          fetchCourse();
                        } catch (err: any) {
                          alert(err.response?.data?.message || 'Failed to assign professor');
                        }
                      }}
                      className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                    >
                      Add Professor
                    </button>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Current Professors:</h3>
                    {course.professors && course.professors.length > 0 ? (
                      <div className="space-y-2">
                        {course.professors.map((prof: any) => (
                          <div key={prof.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium">{prof.name || prof.username}</div>
                              <div className="text-sm text-gray-500">{prof.email}</div>
                            </div>
                            <button 
                              onClick={async () => {
                                if (!confirm('Remove this professor from the course?')) return;
                                try {
                                  await coursesApi.removeProfessor(id!, prof.id);
                                  alert('Professor removed successfully!');
                                  fetchCourse();
                                } catch (err: any) {
                                  alert(err.response?.data?.message || 'Failed to remove professor');
                                }
                              }}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No professors assigned yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
