import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api/client';
import type { Course } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { CreateCourseForm } from './CreateCourseForm';

export const CourseList: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'PROFESSOR';
  const qc = useQueryClient();
    const { data: courses, isLoading, error } = useQuery<Course[]>({
      queryKey: ['courses', isAdmin ? 'all' : 'mine'],
      queryFn: async () => {
        const { data } = isAdmin ? await coursesApi.getAll() : await coursesApi.getMine();
        return data;
      },
      refetchOnWindowFocus: true,
    });
  const unenrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return coursesApi.selfUnenroll(courseId);
    },
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['courses', isAdmin ? 'all' : 'mine'] });
    }
  });

  const currentYear = new Date().getFullYear();
  const [edit, setEdit] = useState<{ code: string; name: string; period: string } | null>(null);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => coursesApi.delete(id),
    onSuccess: () => {
        qc.invalidateQueries({ queryKey: ['courses', isAdmin ? 'all' : 'mine'] });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!edit) return;
      const [yr, tm] = edit.period.includes('-') ? edit.period.split('-') : [currentYear.toString(), '1'];
      const period = `${yr}-${tm}`;
      return coursesApi.update(edit.code, { name: edit.name, period });
    },
    onSuccess: () => {
      setEdit(null);
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.refetchQueries({ queryKey: ['courses', isAdmin ? 'all' : 'mine'] });
    }
  });


  if (isLoading) return <div className="text-center p-4">Loading courses...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error loading courses</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Courses</h1>

      {/* Top section: Admin CRUD or Student Enroll */}
      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create Course</h2>
            <div className="space-y-3">
              {/* Usar el nuevo formulario con Cloudinary */}
              <CreateCourseForm onSuccess={() => { qc.invalidateQueries({ queryKey: ['courses'] }); qc.refetchQueries({ queryKey: ['courses', isAdmin ? 'all' : 'mine'] }); }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Update Course</h2>
            {edit ? (
              <div className="space-y-3">
                <input className="w-full border p-2 rounded bg-gray-100" value={edit.code} readOnly />
                <input className="w-full border p-2 rounded" placeholder="Name" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />
                <input className="w-full border p-2 rounded" placeholder="Period (YYYY-1/2)" value={edit.period} onChange={(e) => setEdit({ ...edit, period: e.target.value })} />
                <div className="flex gap-2">
                  <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>Save</button>
                  <button className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600" onClick={() => setEdit(null)} disabled={updateMutation.isPending}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-8">Select a course below to edit</div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 rounded-lg shadow-lg text-white">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-2">Enroll in other courses</h2>
            <p className="mb-4 text-indigo-100">Browse the catalog to discover and enroll into new courses.</p>
            <Link to="/courses/catalog" className="inline-block bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors">
              Open Catalog
            </Link>
          </div>
        </div>
      )}

      {/* Bottom section: Courses list */}
      <div>
        <h2 className="text-2xl font-bold mb-4">{isAdmin ? 'All Courses' : 'My Courses'}</h2>
        {courses?.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">No courses found.</p>
            {!isAdmin && (
              <Link to="/courses/catalog" className="inline-block mt-4 text-indigo-600 hover:underline">
                Browse the catalog to enroll
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <div key={course.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
                {course.coverImage && (
                  <img src={course.coverImage} alt="Cover" className="w-full h-32 object-cover rounded mb-2" />
                )}
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{course.name}</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-600"><span className="font-medium">Code:</span> {course.code}</p>
                  <p className="text-sm text-gray-600"><span className="font-medium">Period:</span> {course.period}</p>
                </div>
                <Link to={`/courses/${course.id}`} className="inline-block text-indigo-600 hover:text-indigo-800 font-medium text-sm mb-3">
                  View Details &rarr;
                </Link>
                {isAdmin ? (
                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <button className="flex-1 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 transition-colors" onClick={() => setEdit({ code: course.code, name: course.name, period: course.period })}>
                      Edit
                    </button>
                    <button className="flex-1 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors" onClick={() => deleteMutation.mutate(course.id)} disabled={deleteMutation.isPending}>
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t">
                    <button className="w-full bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors" onClick={() => unenrollMutation.mutate(course.id)} disabled={unenrollMutation.isPending}>
                      Unenroll
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
