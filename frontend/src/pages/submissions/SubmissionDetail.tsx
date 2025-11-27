import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { Submission } from '../../types';

export const SubmissionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: submission, isLoading, error } = useQuery<Submission>({
    queryKey: ['submission', id],
    queryFn: async () => {
      const { data } = await api.get(`/submissions/${id}`);
      return data;
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error || !submission) return <div>Error loading submission</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Submission #{submission.id}</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-gray-600">Status</p>
          <p className={`font-bold ${
            submission.status === 'ACCEPTED' ? 'text-green-600' :
            submission.status === 'QUEUED' || submission.status === 'RUNNING' ? 'text-blue-600' :
            'text-red-600'
          }`}>{submission.status}</p>
        </div>
        <div>
          <p className="text-gray-600">Language</p>
          <p className="font-bold">{submission.language}</p>
        </div>
        <div>
          <p className="text-gray-600">Score</p>
          <p className="font-bold">{submission.score ?? '-'}</p>
        </div>
        <div>
          <p className="text-gray-600">Time</p>
          <p className="font-bold">{submission.timeMsTotal ? `${submission.timeMsTotal}ms` : '-'}</p>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-2">Code</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto font-mono text-sm">
          {submission.code}
        </pre>
      </div>
    </div>
  );
};
