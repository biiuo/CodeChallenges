import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { evaluationsApi, coursesApi } from '../../api/client';

export const EditEvaluation: React.FC = () => {
  const { id, courseId } = useParams<{ id: string; courseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    maxDuration: 60,
    challengeIds: [] as number[]
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      // Fetch evaluation data
      const evalResponse = await evaluationsApi.getById(parseInt(id!));
      const evaluation = evalResponse.data;
      
      // Convertir la fecha UTC del backend a hora de Colombia para el input
      const utcDate = new Date(evaluation.date);
      const colombiaOffset = -5 * 60; // Colombia es GMT-5
      const colombiaDate = new Date(utcDate.getTime() + (colombiaOffset + utcDate.getTimezoneOffset()) * 60000);
      
      setFormData({
        name: evaluation.name,
        description: evaluation.description || '',
        date: colombiaDate.toISOString().slice(0, 16),
        maxDuration: evaluation.maxDuration,
        challengeIds: (evaluation as any).challenges?.map((c: any) => c.id) || []
      });

      // Fetch course challenges
      const challengesResponse = await coursesApi.getChallenges(courseId!);
      setChallenges(challengesResponse.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      alert('Failed to load evaluation data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.challengeIds.length === 0) {
      alert('Please select at least one challenge');
      return;
    }

    try {
      // Interpretar la fecha como hora de Colombia y convertir a UTC
      const dateStr = formData.date.replace('T', ' ');
      const colombiaDate = new Date(dateStr + ' GMT-0500');
      
      await evaluationsApi.update(parseInt(id!), {
        name: formData.name,
        description: formData.description,
        date: colombiaDate.toISOString(),
        maxDuration: formData.maxDuration,
        challengeIds: formData.challengeIds
      } as any);
      
      alert('Evaluation updated successfully');
      navigate(`/courses/${courseId}`);
    } catch (err: any) {
      console.error('Failed to update evaluation:', err);
      alert(err.response?.data?.message || 'Failed to update evaluation');
    }
  };

  const toggleChallenge = (challengeId: number) => {
    setFormData(prev => ({
      ...prev,
      challengeIds: prev.challengeIds.includes(challengeId)
        ? prev.challengeIds.filter(id => id !== challengeId)
        : [...prev.challengeIds, challengeId]
    }));
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Edit Evaluation</h1>
        <button
          onClick={() => navigate(`/courses/${courseId}`)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          ← Back to Course
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Evaluation Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Midterm Exam"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="Describe the evaluation..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (minutes) *
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.maxDuration}
              onChange={(e) => setFormData({ ...formData, maxDuration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Challenges * (Click to toggle)
          </label>
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No challenges available in this course
            </div>
          ) : (
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {challenges.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => toggleChallenge(challenge.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.challengeIds.includes(challenge.id)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.challengeIds.includes(challenge.id)}
                          onChange={() => {}}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 ml-6">{challenge.description}</p>
                    </div>
                    <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded ${
                      challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                      challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {challenge.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Update Evaluation
          </button>
          <button
            type="button"
            onClick={() => navigate(`/courses/${courseId}`)}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
