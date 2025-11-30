import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/client';

interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt?: string;
}

export const ProfessorPanel: React.FC = () => {
  const qc = useQueryClient();
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', role: 'PROFESSOR' });
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data } = await usersApi.getAll();
      return data;
    },
  });

  const professors = useMemo(() => (users || []).filter(u => u.role === 'PROFESSOR'), [users]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return professors;
    return professors.filter(u =>
      (u.name?.toLowerCase() || '').includes(q) ||
      (u.username?.toLowerCase() || '').includes(q) ||
      (u.email?.toLowerCase() || '').includes(q)
    );
  }, [professors, query]);

  const createMutation = useMutation({
    mutationFn: async () => usersApi.create(form),
    onSuccess: () => {
      setForm({ name: '', email: '', username: '', password: '', role: 'PROFESSOR' });
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editUser) return;
      return usersApi.update(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        role: 'PROFESSOR',
      });
    },
    onSuccess: () => {
      setEditUser(null);
      qc.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  if (isLoading) return <div className="p-4 text-center">Loading professors...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Professors</h1>
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, username, email"
            className="border p-2 rounded pl-9 w-72"
          />
          <span className="absolute left-2 top-1.5 text-gray-500">🔍</span>
        </div>
      </div>

      {/* Create Professor */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Create Professor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !form.name || !form.email || !form.username || !form.password}
          className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {createMutation.isPending ? 'Creating...' : 'Create Professor'}
        </button>
        {createMutation.isError && <div className="mt-2 text-red-600 text-sm">Failed to create professor.</div>}
      </div>

      {/* Professors Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.username}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                        title="Edit"
                      >
                        <span className="inline-block w-4 h-4">✏️</span>
                        <span className="font-medium">Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete professor ${user.username}?`)) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                        title="Delete"
                      >
                        <span className="inline-block w-4 h-4">🗑️</span>
                        <span className="font-medium">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4">Edit Professor</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={editUser.username}
                  className="w-full border p-2 rounded bg-gray-100"
                  disabled
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save
              </button>
              <button
                onClick={() => setEditUser(null)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorPanel;
