import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Challenge } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const ChallengeList: React.FC = () => {
  const { user } = useAuth();
  const { data: challenges, isLoading, error } = useQuery<Challenge[]>({
    queryKey: ['challenges'],
    queryFn: async () => {
      const { data } = await api.get('/challenges');
      return data;
    },
  });

  if (isLoading) return <div className="text-center p-4">Loading challenges...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error loading challenges</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Challenges</h1>
        {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR') && (
          <Link
            to="/challenges/create"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Create Challenge
          </Link>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {challenges?.map((challenge) => (
          <div key={challenge.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{challenge.title}</h2>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {challenge.difficulty}
              </span>
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">{challenge.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {challenge.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <Link
              to={`/challenges/${challenge.id}`}
              className="block text-center bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              View Details
            </Link>
          </div>
        ))}
      </div>
      {challenges?.length === 0 && (
        <div className="text-center text-gray-500 mt-10">No challenges found.</div>
      )}
    </div>
  );
};
