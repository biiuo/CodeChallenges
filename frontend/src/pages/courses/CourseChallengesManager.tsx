import React, { useEffect, useState } from 'react';
import { coursesApi, challengesApi } from '../../api/client';
import type { Challenge } from '../../types/index';

interface Props {
  courseId: string;
}

export const CourseChallengesManager: React.FC<Props> = ({ courseId }) => {
  const [courseChallenges, setCourseChallenges] = useState<Challenge[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
    try {
      const [courseChallengesRes, allChallengesRes] = await Promise.all([
        coursesApi.getChallenges(courseId),
        challengesApi.getAll()
      ]);
      setCourseChallenges(courseChallengesRes.data);
      setAllChallenges(allChallengesRes.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddChallenges = async () => {
    if (selectedChallenges.length === 0) {
      alert('Please select at least one challenge');
      return;
    }

    try {
      const response = await coursesApi.addChallengesToCourse(courseId, selectedChallenges);
      alert(`Successfully added ${response.data.addedCount} challenge(s)!`);
      setSelectedChallenges([]);
      setShowAddModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to add challenges');
    }
  };

  const handleRemoveChallenge = async (challengeId: string) => {
    if (!confirm('Are you sure you want to remove this challenge from the course?')) return;

    try {
      await coursesApi.removeChallengesFromCourse(courseId, [challengeId]);
      alert('Challenge removed successfully!');
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to remove challenge');
    }
  };

  const toggleChallengeSelection = (challengeId: string) => {
    setSelectedChallenges(prev => 
      prev.includes(challengeId) 
        ? prev.filter(id => id !== challengeId)
        : [...prev, challengeId]
    );
  };

  const availableChallenges = allChallenges
    .filter(ch => !courseChallenges.find(cc => cc.id === ch.id))
    .filter(ch => {
      const matchesSearch = ch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ch.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDifficulty = filterDifficulty === 'ALL' || ch.difficulty === filterDifficulty;
      return matchesSearch && matchesDifficulty;
    });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HARD': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Course Challenges</h2>
          <p className="text-gray-600 mt-1">{courseChallenges.length} challenge(s) assigned</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Challenges
        </button>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courseChallenges.map((challenge) => (
          <div key={challenge.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex-1">{challenge.title}</h3>
              <button
                onClick={() => handleRemoveChallenge(challenge.id)}
                className="text-red-500 hover:text-red-700 ml-2"
                title="Remove from course"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{challenge.description}</p>
            
            <div className="flex items-center justify-between mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                {challenge.difficulty}
              </span>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>⏱️ {challenge.timeLimit}ms</span>
                <span>💾 {challenge.memoryLimit}MB</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                challenge.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                challenge.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {challenge.status}
              </span>
              {challenge.status !== 'PUBLISHED' && (
                <button
                  onClick={async () => {
                    try {
                      await coursesApi.publishChallengeInCourse(courseId, challenge.id, 'PUBLISHED');
                      alert('Challenge published successfully!');
                      fetchData();
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to publish challenge');
                    }
                  }}
                  className="ml-2 text-xs text-green-600 hover:text-green-800 underline"
                >
                  Publish
                </button>
              )}
              {challenge.status === 'PUBLISHED' && (
                <button
                  onClick={async () => {
                    try {
                      await coursesApi.publishChallengeInCourse(courseId, challenge.id, 'DRAFT');
                      alert('Challenge unpublished successfully!');
                      fetchData();
                    } catch (error: any) {
                      alert(error.response?.data?.message || 'Failed to unpublish challenge');
                    }
                  }}
                  className="ml-2 text-xs text-gray-600 hover:text-gray-800 underline"
                >
                  Unpublish
                </button>
              )}
            </div>

            {challenge.tags && challenge.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {challenge.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {courseChallenges.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Challenges Yet</h3>
          <p className="text-gray-500 mb-4">Add your first challenge to get started</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add Challenges
          </button>
        </div>
      )}

      {/* Add Challenges Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Challenges to Course</h2>
                <p className="text-gray-600 mt-1">{selectedChallenges.length} selected</p>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedChallenges([]);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="p-6 border-b bg-gray-50 space-y-4">
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
              <p className="text-sm text-gray-600">
                {availableChallenges.length} challenge(s) available to add
              </p>
            </div>

            {/* Available Challenges List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {availableChallenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    onClick={() => toggleChallengeSelection(challenge.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedChallenges.includes(challenge.id)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedChallenges.includes(challenge.id)}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                            {challenge.difficulty}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{challenge.description.substring(0, 150)}...</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>⏱️ {challenge.timeLimit}ms</span>
                          <span>💾 {challenge.memoryLimit}MB</span>
                          {challenge.tags && challenge.tags.length > 0 && (
                            <span>🏷️ {challenge.tags.slice(0, 2).join(', ')}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {availableChallenges.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-500">No challenges available to add</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedChallenges([]);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddChallenges}
                disabled={selectedChallenges.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add {selectedChallenges.length} Challenge{selectedChallenges.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseChallengesManager;
