import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { challengesApi } from '../../api/client';
import { useQuery } from '@tanstack/react-query';
import type { Challenge } from '../../types';

export const EditChallenge: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { register, handleSubmit, setValue, reset } = useForm();
  const navigate = useNavigate();

  const { data: challenge, isLoading } = useQuery<Challenge>({
    queryKey: ['challenge', id],
    queryFn: async () => {
      const { data } = await challengesApi.getById(id!);
      return data;
    },
  });

  useEffect(() => {
    if (challenge) {
      setValue('title', challenge.title);
      setValue('description', challenge.description);
      setValue('difficulty', challenge.difficulty);
      setValue('tags', challenge.tags.join(', '));
      setValue('timeLimit', challenge.timeLimit);
      setValue('memoryLimit', challenge.memoryLimit);
      setValue('isPublic', challenge.isPublic.toString());
    }
  }, [challenge, setValue]);

  const onSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        tags: data.tags.split(',').map((tag: string) => tag.trim()),
        timeLimit: parseInt(data.timeLimit),
        memoryLimit: parseInt(data.memoryLimit),
        isPublic: data.isPublic === 'true',
      };
      await challengesApi.update(id!, payload);
      navigate('/challenges');
    } catch (err) {
      console.error('Failed to update challenge', err);
      alert('Failed to update challenge');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Challenge</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            {...register('title', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description', { required: true })}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
            <select
              {...register('difficulty', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tags (comma separated)</label>
            <input
              {...register('tags')}
              placeholder="arrays, dp, math"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Time Limit (ms)</label>
            <input
              type="number"
              {...register('timeLimit', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Memory Limit (MB)</label>
            <input
              type="number"
              {...register('memoryLimit', { required: true })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Visibility</label>
          <select
            {...register('isPublic', { required: true })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
          >
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Update Challenge
        </button>
      </form>
    </div>
  );
};
