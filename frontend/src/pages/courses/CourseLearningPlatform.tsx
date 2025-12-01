import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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

export const CourseLearningPlatform: React.FC<Props> = ({ courseId }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const { data: lessons, isLoading } = useQuery<Lesson[]>({
    queryKey: ['lessons', courseId],
    queryFn: async () => {
      const { data } = await coursesApi.getLessons(courseId);
      return data;
    },
  });

  React.useEffect(() => {
    if (lessons && lessons.length > 0 && !selectedLesson) {
      setSelectedLesson(lessons[0]);
    }
  }, [lessons, selectedLesson]);

  if (isLoading) return <div className="text-center p-4">Loading course content...</div>;

  if (!lessons || lessons.length === 0) {
    return (
      <div className="bg-white p-12 rounded-lg shadow text-center">
        <p className="text-gray-500 text-lg">No lessons available yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Sidebar - Lessons List */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow p-4">
        <h2 className="text-xl font-bold mb-4">Lessons</h2>
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedLesson?.id === lesson.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm font-semibold">{index + 1}.</span>
                <div className="flex-1">
                  <p className="font-medium">{lesson.title}</p>
                  {lesson.duration && (
                    <p className={`text-xs ${selectedLesson?.id === lesson.id ? 'text-indigo-100' : 'text-gray-500'}`}>
                      {lesson.duration}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content - Lesson Player */}
      <div className="lg:col-span-2 space-y-6">
        {selectedLesson && (
          <>
            {/* Lesson Header */}
            <div className="bg-white rounded-lg shadow p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{selectedLesson.title}</h1>
              {selectedLesson.duration && (
                <p className="text-sm text-gray-500 mb-4">Duration: {selectedLesson.duration}</p>
              )}
              {selectedLesson.description && (
                <p className="text-gray-700 leading-relaxed">{selectedLesson.description}</p>
              )}
            </div>

            {/* Video Player */}
            {selectedLesson.videoUrl && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-video bg-black flex items-center justify-center">
                  {selectedLesson.videoUrl.includes('youtube.com') || selectedLesson.videoUrl.includes('youtu.be') ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedLesson.videoUrl.replace('watch?v=', 'embed/')}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : selectedLesson.videoUrl.includes('vimeo.com') ? (
                    <iframe
                      src={selectedLesson.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="text-center p-8">
                      <p className="text-white mb-4">Video player</p>
                      <a
                        href={selectedLesson.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Open video in new tab
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resources */}
            {selectedLesson.resources && selectedLesson.resources.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resources</h2>
                <div className="space-y-3">
                  {selectedLesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                        {resource.type === 'pdf' && <span className="text-xl">📄</span>}
                        {resource.type === 'doc' && <span className="text-xl">📝</span>}
                        {resource.type === 'code' && <span className="text-xl">💻</span>}
                        {resource.type === 'link' && <span className="text-xl">🔗</span>}
                        {resource.type === 'other' && <span className="text-xl">📎</span>}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-indigo-600">{resource.title}</p>
                        <p className="text-sm text-gray-500 uppercase">{resource.type}</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-indigo-600">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => {
                  const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
                  if (currentIndex > 0) {
                    setSelectedLesson(lessons[currentIndex - 1]);
                  }
                }}
                disabled={lessons.findIndex((l) => l.id === selectedLesson.id) === 0}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() => {
                  const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
                  if (currentIndex < lessons.length - 1) {
                    setSelectedLesson(lessons[currentIndex + 1]);
                  }
                }}
                disabled={lessons.findIndex((l) => l.id === selectedLesson.id) === lessons.length - 1}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseLearningPlatform;
