import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '../../api/client';
import type { Challenge, Submission } from '../../types';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, reset } = useForm();
  const [submissionResult, setSubmissionResult] = React.useState<Submission | null>(null);

  const { data: challenge, isLoading, error } = useQuery<Challenge>({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const { data } = await api.get(`/challenges/${id}`);
      return data;
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        challengeId: id,
        code: data.code,
        language: data.language,
      };
      const response = await api.post('/submissions', payload);
      setSubmissionResult(response.data);
      reset();
    } catch (err) {
      console.error('Submission failed', err);
      alert('Submission failed');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error || !challenge) return <div>Error loading challenge</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">{challenge.title}</h1>
            <span className={`px-3 py-1 rounded font-bold ${
              challenge.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
              challenge.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {challenge.difficulty}
            </span>
          </div>
          <div className="prose max-w-none mb-6">
            <p>{challenge.description}</p>
          </div>
          <div className="flex gap-4 text-sm text-gray-600">
            <div>Time Limit: {challenge.timeLimit}ms</div>
            <div>Memory Limit: {challenge.memoryLimit}MB</div>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Submit Solution</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Language</label>
              <select
                {...register('language', { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Code</label>
              <textarea
                {...register('code', { required: true })}
                rows={10}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono"
                placeholder="Write your code here..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
            >
              Submit
            </button>
          </form>
        </div>

        {submissionResult && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2">Submission Result</h3>
            <div className={`p-4 rounded ${
              submissionResult.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
              submissionResult.status === 'QUEUED' || submissionResult.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              <div className="font-bold">Status: {submissionResult.status}</div>
              {submissionResult.score !== undefined && <div>Score: {submissionResult.score}</div>}
              {submissionResult.timeMsTotal !== undefined && <div>Time: {submissionResult.timeMsTotal}ms</div>}
            </div>
            <div className="mt-2 text-center">
                <Link to={`/submissions/${submissionResult.id}`} className="text-indigo-600 hover:underline">View Full Details</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
