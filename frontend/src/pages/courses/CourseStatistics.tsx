import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/client';

interface Props {
  courseId: string;
}

interface CourseStatistics {
  courseId: string;
  courseName: string;
  totalStudents: number;
  totalChallenges: number;
  totalSubmissions: number;
  challengeStats: {
    challengeId: string;
    title: string;
    difficulty: string;
    totalAttempts: number;
    successfulSubmissions: number;
    successRate: number;
  }[];
  studentProgress: {
    studentId: string;
    studentName: string;
    challengesCompleted: number;
    totalSubmissions: number;
    averageScore: number;
  }[];
}

const CourseStatistics: React.FC<Props> = ({ courseId }) => {
  const [stats, setStats] = useState<CourseStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'overview' | 'challenges' | 'students'>('overview');

  useEffect(() => {
    fetchStatistics();
  }, [courseId]);

  const fetchStatistics = async () => {
    try {
      const response = await coursesApi.getStatistics(courseId);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-4xl mb-4">📊</div>
        <p>No statistics available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{stats.courseName}</h2>
        <p className="text-gray-600 mt-1">Course Statistics & Analytics</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setView('overview')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            view === 'overview'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setView('challenges')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            view === 'challenges'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          📝 Challenge Stats
        </button>
        <button
          onClick={() => setView('students')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 ${
            view === 'students'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          👥 Student Progress
        </button>
      </div>

      {/* Overview Tab */}
      {view === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-3xl font-bold">{stats.totalStudents}</div>
            <div className="text-indigo-100 mt-1">Total Students</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-2">📝</div>
            <div className="text-3xl font-bold">{stats.totalChallenges}</div>
            <div className="text-green-100 mt-1">Total Challenges</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
            <div className="text-4xl mb-2">📤</div>
            <div className="text-3xl font-bold">{stats.totalSubmissions}</div>
            <div className="text-purple-100 mt-1">Total Submissions</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200 col-span-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Avg. Submissions per Student</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents > 0
                    ? (stats.totalSubmissions / stats.totalStudents).toFixed(1)
                    : '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Challenges per Student</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalStudents > 0
                    ? (stats.studentProgress.reduce((sum, s) => sum + s.challengesCompleted, 0) / stats.totalStudents).toFixed(1)
                    : '0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Overall Success Rate</div>
                <div className={`text-2xl font-bold ${getSuccessRateColor(
                  stats.challengeStats.length > 0
                    ? stats.challengeStats.reduce((sum, c) => sum + c.successRate, 0) / stats.challengeStats.length
                    : 0
                )}`}>
                  {stats.challengeStats.length > 0
                    ? (stats.challengeStats.reduce((sum, c) => sum + c.successRate, 0) / stats.challengeStats.length).toFixed(1)
                    : '0'}%
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Stats Tab */}
      {view === 'challenges' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challenge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Attempts
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Successful
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.challengeStats.map((challenge) => (
                    <tr key={challenge.challengeId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{challenge.title}</div>
                        <div className="text-xs text-gray-500">{challenge.challengeId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {challenge.totalAttempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                        {challenge.successfulSubmissions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`text-sm font-semibold ${getSuccessRateColor(challenge.successRate)}`}>
                            {challenge.successRate.toFixed(1)}%
                          </div>
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                challenge.successRate >= 70 ? 'bg-green-500' :
                                challenge.successRate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(challenge.successRate, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {stats.challengeStats.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>No challenge statistics available yet</p>
            </div>
          )}
        </div>
      )}

      {/* Student Progress Tab */}
      {view === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Challenges Completed
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Submissions
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Score
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.studentProgress
                    .sort((a, b) => b.averageScore - a.averageScore)
                    .map((student, index) => (
                      <tr key={student.studentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-orange-600' : 'bg-indigo-600'
                            }`}>
                              {index < 3 ? ['🥇', '🥈', '🥉'][index] : student.studentName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{student.studentName}</div>
                              <div className="text-xs text-gray-500">{student.studentId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {student.challengesCompleted} / {stats.totalChallenges}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                          {student.totalSubmissions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`text-sm font-semibold ${getSuccessRateColor(student.averageScore)}`}>
                            {student.averageScore.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${(student.challengesCompleted / stats.totalChallenges) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {((student.challengesCompleted / stats.totalChallenges) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {stats.studentProgress.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">👥</div>
              <p>No student progress data available yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseStatistics;
