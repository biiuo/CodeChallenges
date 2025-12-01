import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { evaluationsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const EvaluationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    fetchEvaluation();
  }, [id]);

  useEffect(() => {
    if (!evaluation) return;

    const interval = setInterval(() => {
      const now = new Date();
      const startDate = new Date(evaluation.date);
      const endDate = new Date(startDate.getTime() + evaluation.maxDuration * 60000);

      if (now < startDate) {
        const diff = startDate.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeRemaining(`Starts in ${hours}h ${minutes}m`);
      } else if (now >= startDate && now <= endDate) {
        const diff = endDate.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s remaining`);
      } else {
        setTimeRemaining('Finished');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [evaluation]);

  const fetchEvaluation = async () => {
    try {
      const response = await evaluationsApi.getById(parseInt(id!));
      console.log('Evaluation data:', response.data);
      setEvaluation(response.data);
    } catch (err: any) {
      console.error('Failed to fetch evaluation:', err);
      console.error('Error details:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to load evaluation. You may not have access to this evaluation.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!evaluation) return <div className="p-6">Evaluation not found</div>;

  const now = new Date();
  const startDate = new Date(evaluation.date);
  const endDate = new Date(startDate.getTime() + evaluation.maxDuration * 60000);
  const isActive = now >= startDate && now <= endDate;
  const isPast = now > endDate;
  const isFuture = now < startDate;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{evaluation.name}</h1>
        <button
          onClick={() => navigate(`/courses/${evaluation.courseId}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to Course
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Evaluation Information</h2>
            <p className="text-gray-600">{evaluation.description}</p>
          </div>
          <div>
            {isActive && (
              <span className="px-4 py-2 bg-green-100 text-green-800 text-lg font-bold rounded-full">
                🟢 ACTIVE
              </span>
            )}
            {isPast && (
              <span className="px-4 py-2 bg-gray-100 text-gray-800 text-lg font-bold rounded-full">
                FINISHED
              </span>
            )}
            {isFuture && (
              <span className="px-4 py-2 bg-blue-100 text-blue-800 text-lg font-bold rounded-full">
                UPCOMING
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <div className="text-sm text-gray-600">Start Time</div>
            <div className="font-semibold">{new Date(evaluation.date).toLocaleString('es-CO', { 
              timeZone: 'America/Bogota',
              dateStyle: 'short',
              timeStyle: 'short'
            })}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Duration</div>
            <div className="font-semibold">{evaluation.maxDuration} minutes</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Time Status</div>
            <div className={`font-semibold ${isActive ? 'text-green-600' : isPast ? 'text-gray-600' : 'text-blue-600'}`}>
              {timeRemaining}
            </div>
          </div>
        </div>

        {isFuture && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <p className="text-blue-800">
              ⏰ This evaluation hasn't started yet. Come back at the scheduled time.
            </p>
          </div>
        )}

        {isPast && user?.role === 'STUDENT' && (
          <button
            onClick={() => navigate(`/evaluations/${id}/my-results`)}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            View My Results
          </button>
        )}

        {isPast && user?.role !== 'STUDENT' && (
          <button
            onClick={() => navigate(`/evaluations/${id}/results`)}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
          >
            View All Results
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Challenges ({evaluation.challenges?.length || 0})</h2>
        
        {(!evaluation.challenges || evaluation.challenges.length === 0) ? (
          <p className="text-gray-500">No challenges in this evaluation</p>
        ) : (
          <div className="space-y-4">
            {evaluation.challenges.map((challenge: any) => (
              <div
                key={challenge.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                        challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty}
                      </span>
                      {challenge.timeLimit && (
                        <span className="text-sm text-gray-500">
                          ⏱️ {challenge.timeLimit}ms limit
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {user?.role === 'STUDENT' && (
                    <div className="ml-4">
                      {isActive ? (
                        <Link
                          to={`/challenges/${challenge.id}?evaluationId=${id}`}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                        >
                          🚀 Solve Challenge
                        </Link>
                      ) : isFuture ? (
                        <button
                          disabled
                          className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
                        >
                          ⏳ Not Started
                        </button>
                      ) : (
                        <Link
                          to={`/challenges/${challenge.id}`}
                          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          👁️ View Challenge
                        </Link>
                      )}
                    </div>
                  )}

                  {user?.role !== 'STUDENT' && (
                    <div className="ml-4">
                      <Link
                        to={`/challenges/${challenge.id}`}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                      >
                        View Challenge
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
