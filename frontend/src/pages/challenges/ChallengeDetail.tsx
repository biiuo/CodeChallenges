import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { challengesApi, submissionsApi } from '../../api/client';
import type { Challenge, Submission } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const ChallengeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const [submissionResult, setSubmissionResult] = React.useState<Submission | null>(null);
  const [testCasesJson, setTestCasesJson] = React.useState('');
  const [solutionCode, setSolutionCode] = React.useState('');
  const [solutionLanguage, setSolutionLanguage] = React.useState('python');

  const { data: challenge, isLoading, error } = useQuery<Challenge>({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const { data } = await challengesApi.getById(id!);
      return data;
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        challengeId: id!,
        code: data.code,
        language: data.language,
      };
      const response = await submissionsApi.create(payload);
      setSubmissionResult(response.data);
      reset();
    } catch (err) {
      console.error('Submission failed', err);
      alert('Submission failed');
    }
  };

  const handleUploadTestCases = async () => {
    try {
      const testCases = JSON.parse(testCasesJson);
      if (!Array.isArray(testCases)) {
        alert('Test cases must be an array');
        return;
      }
      await challengesApi.addTestCases(id!, testCases);
      alert('Test cases uploaded successfully');
      setTestCasesJson('');
    } catch (err) {
      console.error('Failed to upload test cases', err);
      alert('Failed to upload test cases. Ensure valid JSON.');
    }
  };

  const handleUploadSolution = async () => {
    try {
      if (!solutionCode.trim()) {
        alert('Please enter solution code');
        return;
      }
      await challengesApi.uploadSolution(id!, { code: solutionCode, language: solutionLanguage });
      alert('Solution code uploaded successfully');
      setSolutionCode('');
      // Refrescar el challenge para mostrar el código de solución
      window.location.reload();
    } catch (err) {
      console.error('Failed to upload solution', err);
      alert('Failed to upload solution code');
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

        {(user?.role === 'ADMIN' || user?.role === 'PROFESSOR') && (
          <>
            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-xl font-bold mb-4">Upload Solution Code</h2>
              <p className="text-sm text-gray-600 mb-4">
                Sube el código de solución de referencia. Los estudiantes podrán ver este código en los detalles del challenge.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={solutionLanguage}
                  onChange={(e) => setSolutionLanguage(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Solution Code</label>
                <textarea
                  value={solutionCode}
                  onChange={(e) => setSolutionCode(e.target.value)}
                  rows={12}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono"
                  placeholder="Pega aquí el código de solución..."
                />
              </div>
              <button
                onClick={handleUploadSolution}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Upload Solution Code
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow mt-6">
              <h2 className="text-xl font-bold mb-4">Manage Test Cases</h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Test Cases (JSON Array)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Format: <code>[{`{"caseNumber": 1, "input": "...", "output": "...", "visible": true}`}]</code>
                </p>
                <textarea
                  value={testCasesJson}
                  onChange={(e) => setTestCasesJson(e.target.value)}
                  rows={8}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border font-mono"
                  placeholder='[{"caseNumber": 1, "input": "2 7 11 15\n9", "output": "0 1", "visible": true}, {"caseNumber": 2, "input": "3 2 4\n6", "output": "1 2", "visible": false}]'
                />
              </div>
              <button
                onClick={handleUploadTestCases}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Upload Test Cases
              </button>
            </div>
          </>
        )}

        {/* Mostrar código de solución para estudiantes */}
        {user?.role === 'STUDENT' && challenge.solutionCode && (
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-xl font-bold mb-4">💡 Solution Code</h2>
            <p className="text-sm text-gray-600 mb-4">
              Código de solución de referencia en <strong>{challenge.solutionLanguage}</strong>
            </p>
            <div className="bg-gray-50 p-4 rounded border">
              <pre className="overflow-x-auto font-mono text-sm whitespace-pre-wrap">
                {challenge.solutionCode}
              </pre>
            </div>
          </div>
        )}
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
