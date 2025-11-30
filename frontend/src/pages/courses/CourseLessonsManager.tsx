import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesApi } from '../../api/client';

interface Lesson {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: string;
  order: number;
  resources: Resource[];
}

interface Resource {
  id: string;
  title: string;
  url: string;
  type: string;
}

interface Props {
  courseId: string;
}

export const CourseLessonsManager: React.FC<Props> = ({ courseId }) => {
  const qc = useQueryClient();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', videoUrl: '', duration: '', order: 0 });
  const [resourceForm, setResourceForm] = useState({ title: '', url: '', type: 'link' });

  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const { data } = await coursesApi.getLessons(courseId);
      return data;
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async () => coursesApi.createLesson(courseId, lessonForm),
    onSuccess: () => {
      setLessonForm({ title: '', description: '', videoUrl: '', duration: '', order: 0 });
      qc.invalidateQueries({ queryKey: ['lessons', courseId] });
    },
  });

  const updateLessonMutation = useMutation({
    mutationFn: async (lesson: Lesson) => coursesApi.updateLesson(courseId, lesson.id, lesson),
    onSuccess: () => {
      setSelectedLesson(null);
      qc.invalidateQueries({ queryKey: ['lessons', courseId] });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: string) => coursesApi.deleteLesson(courseId, lessonId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', courseId] }),
  });

  const addResourceMutation = useMutation({
    mutationFn: async (lessonId: string) => coursesApi.addResource(courseId, lessonId, resourceForm),
    onSuccess: () => {
      setResourceForm({ title: '', url: '', type: 'link' });
      qc.invalidateQueries({ queryKey: ['lessons', courseId] });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: async ({ lessonId, resourceId }: { lessonId: string; resourceId: string }) =>
      coursesApi.deleteResource(courseId, lessonId, resourceId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lessons', courseId] }),
  });

  if (isLoading) return <div className="text-center p-4">Loading lessons...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course Content</h2>

      {/* Create Lesson Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Lesson Title"
            value={lessonForm.title}
            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Duration (e.g., 15 min)"
            value={lessonForm.duration}
            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
          />
          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Video URL (YouTube, Vimeo, etc.)"
            value={lessonForm.videoUrl}
            onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
          />
          <textarea
            className="border p-2 rounded md:col-span-2"
            placeholder="Lesson Description"
            rows={3}
            value={lessonForm.description}
            onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
          />
          <input
            type="number"
            className="border p-2 rounded"
            placeholder="Order"
            value={lessonForm.order}
            onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) || 0 })}
          />
        </div>
        <button
          onClick={() => createLessonMutation.mutate()}
          disabled={createLessonMutation.isPending || !lessonForm.title}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {createLessonMutation.isPending ? 'Creating...' : 'Create Lesson'}
        </button>
      </div>

      {/* Lessons List */}
      <div className="grid gap-4">
        {lessons?.map((lesson) => (
          <div key={lesson.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{lesson.title}</h3>
                {lesson.duration && <p className="text-sm text-gray-500">Duration: {lesson.duration}</p>}
                {lesson.description && <p className="text-gray-700 mt-2">{lesson.description}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedLesson(lesson)}
                  className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete lesson "${lesson.title}"?`)) {
                      deleteLessonMutation.mutate(lesson.id);
                    }
                  }}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            {lesson.videoUrl && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-600 mb-2">Video:</p>
                <a
                  href={lesson.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  {lesson.videoUrl}
                </a>
              </div>
            )}

            {/* Resources */}
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Resources</h4>
              {lesson.resources?.length > 0 ? (
                <ul className="space-y-2">
                  {lesson.resources.map((resource) => (
                    <li key={resource.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded">{resource.type}</span>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {resource.title}
                        </a>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete resource "${resource.title}"?`)) {
                            deleteResourceMutation.mutate({ lessonId: lesson.id, resourceId: resource.id });
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No resources yet</p>
              )}

              {/* Add Resource Form */}
              <div className="mt-3 flex gap-2">
                <input
                  className="flex-1 border p-1 rounded text-sm"
                  placeholder="Resource title"
                  value={resourceForm.title}
                  onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                />
                <input
                  className="flex-1 border p-1 rounded text-sm"
                  placeholder="URL"
                  value={resourceForm.url}
                  onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                />
                <select
                  className="border p-1 rounded text-sm"
                  value={resourceForm.type}
                  onChange={(e) => setResourceForm({ ...resourceForm, type: e.target.value })}
                >
                  <option value="link">Link</option>
                  <option value="pdf">PDF</option>
                  <option value="doc">Document</option>
                  <option value="code">Code</option>
                  <option value="other">Other</option>
                </select>
                <button
                  onClick={() => addResourceMutation.mutate(lesson.id)}
                  disabled={!resourceForm.title || !resourceForm.url}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:bg-gray-400"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Lesson Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Edit Lesson</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={selectedLesson.title}
                  onChange={(e) => setSelectedLesson({ ...selectedLesson, title: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={selectedLesson.description || ''}
                  onChange={(e) => setSelectedLesson({ ...selectedLesson, description: e.target.value })}
                  className="w-full border p-2 rounded"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Video URL</label>
                <input
                  type="text"
                  value={selectedLesson.videoUrl || ''}
                  onChange={(e) => setSelectedLesson({ ...selectedLesson, videoUrl: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Duration</label>
                  <input
                    type="text"
                    value={selectedLesson.duration || ''}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, duration: e.target.value })}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input
                    type="number"
                    value={selectedLesson.order}
                    onChange={(e) => setSelectedLesson({ ...selectedLesson, order: parseInt(e.target.value) || 0 })}
                    className="w-full border p-2 rounded"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => updateLessonMutation.mutate(selectedLesson)}
                disabled={updateLessonMutation.isPending}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setSelectedLesson(null)}
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

export default CourseLessonsManager;
