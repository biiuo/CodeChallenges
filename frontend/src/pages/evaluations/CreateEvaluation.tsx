import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { coursesApi, challengesApi, evaluationsApi } from '../../api/client';

export const CreateEvaluation: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [maxDuration, setMaxDuration] = useState(90);
  const [availableChallenges, setAvailableChallenges] = useState<any[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourseChallenges();
  }, [courseId]);

  const fetchCourseChallenges = async () => {
    try {
      const response = await coursesApi.getChallenges(courseId!);
      setAvailableChallenges(response.data);
    } catch (err) {
      console.error('Failed to fetch challenges:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Interpretar la fecha como hora de Colombia y convertir a UTC
      const dateStr = date.replace('T', ' ');
      const colombiaDate = new Date(dateStr + ' GMT-0500');
      
      await evaluationsApi.createInCourse(courseId!, {
        name,
        description,
        date: colombiaDate.toISOString(),
        maxDuration,
        challengeIds: selectedChallenges,
      });
      
      alert('Evaluation created successfully!');
      navigate(`/courses/${courseId}?tab=evaluations`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create evaluation');
    } finally {
      setLoading(false);
    }
  };

  const toggleChallenge = (challengeId: string) => {
    setSelectedChallenges(prev =>
      prev.includes(challengeId)
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Create Evaluation</h1>
        <button
          onClick={() => navigate(`/courses/${courseId}?tab=evaluations`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Parcial 1 - Estructuras de Datos"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            rows={3}
            placeholder="Evaluación sobre listas, pilas, colas y árboles"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={maxDuration}
              onChange={(e) => setMaxDuration(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              min="1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Challenges ({selectedChallenges.length} selected)
          </label>
          {availableChallenges.length === 0 ? (
            <p className="text-gray-500 text-sm">No challenges available in this course</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {availableChallenges.map((challenge) => (
                <label
                  key={challenge.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedChallenges.includes(challenge.id)}
                    onChange={() => toggleChallenge(challenge.id)}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{challenge.title}</div>
                    <div className="text-sm text-gray-600">{challenge.id}</div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      challenge.difficulty === 'EASY'
                        ? 'bg-green-100 text-green-800'
                        : challenge.difficulty === 'MEDIUM'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {challenge.difficulty}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || selectedChallenges.length === 0}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Creating...' : 'Create Evaluation'}
          </button>
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}?tab=evaluations`)}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
