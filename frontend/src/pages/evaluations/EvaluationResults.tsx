import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../../api/client';

export const EvaluationResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await evaluationsApi.getStatistics(parseInt(id!));
      setResults(response.data);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading results...</div>;
  if (!results) return <div className="p-6">No results found</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Evaluation Results</h1>
        <button
          onClick={() => navigate(`/evaluations/${id}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to Evaluation
        </button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Total Submissions</div>
          <div className="text-3xl font-bold text-gray-900">{results.totalSubmissions}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Accepted</div>
          <div className="text-3xl font-bold text-green-600">{results.acceptedSubmissions}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Acceptance Rate</div>
          <div className="text-3xl font-bold text-indigo-600">{results.acceptanceRate}%</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600 mb-1">Unique Students</div>
          <div className="text-3xl font-bold text-gray-900">{results.uniqueStudents}</div>
        </div>
      </div>

      {/* Top Students */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Top Students</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Student</th>
                <th className="text-left p-3">Username</th>
                <th className="text-left p-3">Total Score</th>
                <th className="text-left p-3">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {results.topStudents?.map((student: any, index: number) => (
                <tr key={student.user.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <span className={`font-bold ${index === 0 ? 'text-yellow-600' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{student.user.name}</td>
                  <td className="p-3 text-gray-600">{student.user.username}</td>
                  <td className="p-3">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                      {student.totalScore}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">{student.totalSubmissions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submissions by Challenge */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Performance by Challenge</h2>
        <div className="space-y-4">
          {results.submissionsByChallenge?.map((challenge: any) => (
            <div key={challenge.challengeId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-gray-900">{challenge.challengeId}</div>
                <div className="text-sm text-gray-600">{challenge.totalSubmissions} submissions</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-indigo-600 h-4 rounded-full"
                    style={{ width: `${challenge.averageScore}%` }}
                  />
                </div>
                <div className="font-semibold text-gray-900">{challenge.averageScore}/100</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
