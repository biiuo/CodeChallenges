import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { submissionsApi } from '../../api/client';
import type { Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const SubmissionList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';
  const [filters, setFilters] = useState({
    userId: '',
    challengeId: '',
    status: '',
    language: '',
  });

  const { data: submissions, isLoading, error } = useQuery<Submission[]>({
    queryKey: ['submissions', filters],
    queryFn: async () => {
      const { data } = await submissionsApi.getAll(filters);
      return data;
    },
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({ userId: '', challengeId: '', status: '', language: '' });
  };

  if (isLoading) return <div className="text-center p-4">Loading submissions...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error loading submissions</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{isAdmin ? 'All Submissions' : 'My Submissions'}</h1>

      {/* Filters - Solo para admin */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Challenge ID"
              value={filters.challengeId}
              onChange={(e) => handleFilterChange('challengeId', e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Statuses</option>
              <option value="ACCEPTED">ACCEPTED</option>
              <option value="WRONG_ANSWER">WRONG_ANSWER</option>
              <option value="TIME_LIMIT_EXCEEDED">TIME_LIMIT_EXCEEDED</option>
              <option value="RUNTIME_ERROR">RUNTIME_ERROR</option>
              <option value="COMPILATION_ERROR">COMPILATION_ERROR</option>
              <option value="RUNNING">RUNNING</option>
              <option value="QUEUED">QUEUED</option>
            </select>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">All Languages</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      )}
      {/* Tabla de submissions */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Challenge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time (ms)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions?.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{submission.id}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.userId}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.challengeId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">{submission.language}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      submission.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      submission.status === 'QUEUED' || submission.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.score ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.timeMsTotal ?? '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link to={`/submissions/${submission.id}`} className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {submissions?.length === 0 && (
        <div className="text-center text-gray-500 py-10">No submissions found.</div>
      )}
    </div>
  );
};
