import React, { useEffect, useState } from 'react';
import { coursesApi } from '../../api/client';
import type { Course } from '../../types/index';

interface Props {
  courseId: string;
  onSuccess?: () => void;
}

export const CloneChallengesModal: React.FC<Props> = ({ courseId, onSuccess }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedSourceCourse, setSelectedSourceCourse] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesApi.getAll();
      // Filter out the current course
      setCourses(response.data.filter((c: Course) => c.id !== courseId));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleClone = async () => {
    if (!selectedSourceCourse) {
      alert('Please select a source course');
      return;
    }

    if (!confirm('This will copy all challenges from the selected course to the current course. Continue?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await coursesApi.cloneChallenges(courseId, selectedSourceCourse);
      alert(`✅ ${response.data.message}\n\nCloned: ${response.data.clonedCount}\nSkipped: ${response.data.skippedCount}`);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to clone challenges');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.period.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Clone Challenges from Another Course</h3>
        <p className="text-gray-600">
          Copy all challenges from another course to this one. Duplicate challenges will be skipped automatically.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search Source Course
        </label>
        <input
          type="text"
          placeholder="Search by name, code, or period..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Source Course ({filteredCourses.length} available)
        </label>
        <div className="border border-gray-300 rounded-lg max-h-96 overflow-y-auto">
          {filteredCourses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📚</div>
              <p>No courses found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCourses.map((course) => (
                <label
                  key={course.id}
                  className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                    selectedSourceCourse === course.id
                      ? 'bg-indigo-50 border-l-4 border-indigo-600'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="sourceCourse"
                    value={course.id}
                    checked={selectedSourceCourse === course.id}
                    onChange={(e) => setSelectedSourceCourse(e.target.value)}
                    className="w-5 h-5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{course.name}</div>
                    <div className="text-sm text-gray-600">
                      {course.code} • Period: {course.period}
                    </div>
                    {course.description && (
                      <div className="text-xs text-gray-500 mt-1">{course.description}</div>
                    )}
                  </div>
                  {course.isPublished && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Published
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={handleClone}
          disabled={!selectedSourceCourse || loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Cloning...
            </>
          ) : (
            <>
              <span>📋</span>
              Clone Challenges
            </>
          )}
        </button>
      </div>

      {selectedSourceCourse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-2">
            <span className="text-blue-600">ℹ️</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What will happen:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All challenges from the source course will be copied to this course</li>
                <li>Challenges already in this course will be skipped</li>
                <li>No challenges will be modified or removed</li>
                <li>You'll receive a summary of the operation</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloneChallengesModal;
