import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../../api/client';

export const MyEvaluationResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await evaluationsApi.getMyResults(parseInt(id!));
      setResults(response.data);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading your results...</div>;
  if (!results) return <div className="p-6">No results found</div>;

  const { evaluation, score, challengeScores, submissions } = results;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Results: {evaluation.name}</h1>
        <button
          onClick={() => navigate(`/evaluations/${id}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to Evaluation
        </button>
      </div>

      {/* Score Overview */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-center">
          <div className="text-sm uppercase tracking-wide mb-2">Your Final Score</div>
          <div className="text-6xl font-bold mb-2">{score}</div>
          <div className="text-xl">out of 100</div>
        </div>
      </div>

      {/* Performance by Challenge */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Performance by Challenge</h2>
        <div className="space-y-4">
          {evaluation.challenges.map((challenge: any) => {
            const challengeScore = challengeScores[challenge.id] || 0;
            const challengeSubs = submissions.filter((s: any) => s.challengeId === challenge.id);
            const bestSub = challengeSubs.length > 0 
              ? challengeSubs.reduce((best: any, curr: any) => 
                  (curr.score || 0) > (best.score || 0) ? curr : best
                )
              : null;

            return (
              <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{challenge.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                        challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      <span className="text-sm text-gray-600">
                        {challengeSubs.length} {challengeSubs.length === 1 ? 'attempt' : 'attempts'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      challengeScore === 100 ? 'text-green-600' :
                      challengeScore >= 50 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {challengeScore}
                    </div>
                    <div className="text-sm text-gray-600">/ 100</div>
                  </div>
                </div>

                {bestSub && (
                  <div className="bg-gray-50 rounded p-3 mt-2">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-semibold">Best Submission:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          bestSub.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                          bestSub.status === 'WRONG_ANSWER' ? 'bg-red-100 text-red-800' :
                          bestSub.status === 'TIME_LIMIT_EXCEEDED' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {bestSub.status}
                        </span>
                      </div>
                      <div className="text-gray-600">
                        {bestSub.timeMsTotal ? `${bestSub.timeMsTotal}ms` : '-'}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex-1 bg-gray-200 rounded-full h-3 mt-3">
                  <div
                    className={`h-3 rounded-full ${
                      challengeScore === 100 ? 'bg-green-600' :
                      challengeScore >= 50 ? 'bg-yellow-600' :
                      'bg-red-600'
                    }`}
                    style={{ width: `${challengeScore}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All Submissions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">All Submissions ({submissions.length})</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Challenge</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Score</th>
                <th className="text-left p-3">Time</th>
                <th className="text-left p-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub: any) => (
                <tr key={sub.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-mono text-gray-600">#{sub.id}</td>
                  <td className="p-3 font-semibold">{sub.challengeTitle}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      sub.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      sub.status === 'WRONG_ANSWER' ? 'bg-red-100 text-red-800' :
                      sub.status === 'TIME_LIMIT_EXCEEDED' ? 'bg-orange-100 text-orange-800' :
                      sub.status === 'RUNTIME_ERROR' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="p-3 font-semibold">{sub.score ?? 0}</td>
                  <td className="p-3 text-gray-600">{sub.timeMsTotal ? `${sub.timeMsTotal}ms` : '-'}</td>
                  <td className="p-3 text-gray-600">{new Date(sub.createdAt).toLocaleString('es-CO', { 
                    timeZone: 'America/Bogota',
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
