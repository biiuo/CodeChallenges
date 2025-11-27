import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { coursesApi } from '../../api/client';
import type { Course } from '../../types';

export const CourseList: React.FC = () => {
  const { data: courses, isLoading, error } = useQuery<Course[]>({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data } = await coursesApi.getAll();
      return data;
    },
  });


  if (isLoading) return <div className="text-center p-4">Loading courses...</div>;
  if (error) return <div className="text-center text-red-500 p-4">Error loading courses</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Courses</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{course.name}</h2>
            <p className="text-gray-600 mb-2">Code: {course.code}</p>
            <p className="text-gray-600">Period: {course.period}</p>
          </div>
        ))}
      </div>
      {courses?.length === 0 && (
        <div className="text-center text-gray-500 mt-10">No courses found.</div>
      )}
    </div>
  );
};
