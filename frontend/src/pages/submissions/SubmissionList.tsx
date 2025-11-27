import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import type { Submission } from '../../types';

export const SubmissionList: React.FC = () => {
  // Note: The backend controller for GET /submissions wasn't explicitly shown in the snippet as a list endpoint,
  // but usually it exists. If not, we might need to adjust.
  // Assuming GET /submissions returns a list.
  const { data: submissions, isLoading, error } = useQuery<Submission[]>({
    queryKey: ['submissions'],
    queryFn: async () => {
      const { data } = await api.get('/submissions');
      return data;
    },
  });

  if (isLoading) return <div className="text-center p-4">Loading submissions...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error loading submissions</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Submissions</h1>
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {submissions?.map((submission) => (
            <li key={submission.id}>
              <Link to={`/submissions/${submission.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-indigo-600 truncate">
                      Submission #{submission.id}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        submission.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                        submission.status === 'QUEUED' || submission.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {submission.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        Language: {submission.language}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <p>
                        {new Date(submission.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      {submissions?.length === 0 && (
        <div className="text-center text-gray-500 mt-10">No submissions found.</div>
      )}
    </div>
  );
};
