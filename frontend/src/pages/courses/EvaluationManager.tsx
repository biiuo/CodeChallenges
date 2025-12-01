import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { evaluationsApi } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const EvaluationManager: React.FC<{ courseId: string }> = ({ courseId }) => {
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';

  useEffect(() => {
    fetchEvaluations();
  }, [courseId]);

  const fetchEvaluations = async () => {
    try {
      const response = await evaluationsApi.listByCourse(courseId);
      setEvaluations(response.data);
    } catch (err) {
      console.error('Failed to fetch evaluations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta evaluación?')) return;
    
    try {
      await evaluationsApi.delete(id);
      fetchEvaluations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete evaluation');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isAdmin && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Evaluations</h2>
          <button
            onClick={() => navigate(`/courses/${courseId}/evaluations/create`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            + Create Evaluation
          </button>
        </div>
      )}

      {evaluations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <p>No evaluations yet</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {evaluations.map((evaluation: any) => {
            const now = new Date();
            const startDate = new Date(evaluation.date);
            const endDate = new Date(startDate.getTime() + evaluation.maxDuration * 60000);
            const isActive = now >= startDate && now <= endDate;
            const isPast = now > endDate;
            const isFuture = now < startDate;

            return (
              <div
                key={evaluation.id}
                className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-600 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{evaluation.name}</h3>
                  {isActive && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                      ACTIVE
                    </span>
                  )}
                  {isPast && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                      FINISHED
                    </span>
                  )}
                  {isFuture && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                      UPCOMING
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 mb-4 text-sm">{evaluation.description}</p>
                
                <div className="space-y-2 text-sm text-gray-700 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📅 Date:</span>
                    <span>{new Date(evaluation.date).toLocaleString('es-CO', { 
                      timeZone: 'America/Bogota',
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">⏱️ Duration:</span>
                    <span>{evaluation.maxDuration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">📝 Challenges:</span>
                    <span>{evaluation.challenges?.length || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {user?.role === 'STUDENT' ? (
                    <>
                      {isActive && (
                        <button
                          onClick={() => navigate(`/evaluations/${evaluation.id}`)}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                        >
                          🚀 Enter Evaluation
                        </button>
                      )}
                      {isFuture && (
                        <button
                          disabled
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-600 rounded-lg text-sm cursor-not-allowed"
                        >
                          ⏳ Not Started Yet
                        </button>
                      )}
                      {isPast && (
                        <>
                          <button
                            onClick={() => navigate(`/evaluations/${evaluation.id}`)}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                          >
                            👁️ View Evaluation
                          </button>
                          <button
                            onClick={() => navigate(`/evaluations/${evaluation.id}/my-results`)}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                          >
                            📊 My Results
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => navigate(`/evaluations/${evaluation.id}`)}
                        className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => navigate(`/evaluations/${evaluation.id}/results`)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Results
                      </button>
                      <button
                        onClick={() => navigate(`/courses/${courseId}/evaluations/${evaluation.id}/edit`)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(evaluation.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
