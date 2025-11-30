import { useEffect, useMemo, useState } from 'react';
import { usersApi } from '../../api/client';

type SubmissionItem = {
  id: string;
  challengeId: string;
  challengeTitle?: string;
  status: string;
  score: number;
  createdAt: string;
  testCasesCount: number;
};

export default function UserActivity() {
  const [userId, setUserId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const canQuery = useMemo(() => userId.trim().length > 0, [userId]);

  const fetchData = async () => {
    if (!canQuery) return;
    setLoading(true);
    try {
      const res = await usersApi.getUserActivity({
        userId,
        courseId: courseId || undefined,
        challengeId: challengeId || undefined,
        status: status || undefined,
        from: from || undefined,
        to: to || undefined,
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // optional: auto-load when userId entered
  }, [userId]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">User Activity (Admin)</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <input className="border p-2" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <input className="border p-2" placeholder="Course ID (optional)" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
        <input className="border p-2" placeholder="Challenge ID (optional)" value={challengeId} onChange={(e) => setChallengeId(e.target.value)} />
        <select className="border p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any status</option>
          <option value="ACCEPTED">ACCEPTED</option>
          <option value="WRONG_ANSWER">WRONG_ANSWER</option>
          <option value="TIME_LIMIT_EXCEEDED">TIME_LIMIT_EXCEEDED</option>
          <option value="RUNTIME_ERROR">RUNTIME_ERROR</option>
          <option value="COMPILATION_ERROR">COMPILATION_ERROR</option>
          <option value="RUNNING">RUNNING</option>
          <option value="QUEUED">QUEUED</option>
        </select>
        <input type="datetime-local" className="border p-2" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="datetime-local" className="border p-2" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!canQuery || loading} onClick={fetchData}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>
      {data && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <div>Submissions: {data.totals?.submissions}</div>
            <div>Passed: {data.totals?.passed}</div>
            <div>Failed: {data.totals?.failed}</div>
          </div>
          <h2 className="font-semibold">Challenges Summary</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">Challenge</th>
                  <th className="p-2">Attempts</th>
                  <th className="p-2">Best Score</th>
                  <th className="p-2">Last Status</th>
                  <th className="p-2">Last Submitted</th>
                </tr>
              </thead>
              <tbody>
                {data.challenges?.map((c: any) => (
                  <tr key={c.challengeId} className="border-b">
                    <td className="p-2">{c.challengeTitle || c.challengeId}</td>
                    <td className="p-2">{c.attempts}</td>
                    <td className="p-2">{c.bestScore}</td>
                    <td className="p-2">{c.lastStatus}</td>
                    <td className="p-2">{new Date(c.lastSubmittedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="font-semibold">Submissions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-2">ID</th>
                  <th className="p-2">Challenge</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Score</th>
                  <th className="p-2">Tests</th>
                  <th className="p-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {data.submissions?.map((s: SubmissionItem) => (
                  <tr key={s.id} className="border-b">
                    <td className="p-2">{s.id}</td>
                    <td className="p-2">{s.challengeTitle || s.challengeId}</td>
                    <td className="p-2">{s.status}</td>
                    <td className="p-2">{s.score}</td>
                    <td className="p-2">{s.testCasesCount}</td>
                    <td className="p-2">{new Date(s.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
