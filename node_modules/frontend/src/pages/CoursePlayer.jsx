import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import ChatWidget from '../components/ChatWidget';
import { CheckCircle, PlayCircle, FileText } from 'lucide-react';

const GET_COURSE = gql`
  query GetCourse($slug: String!) {
    getCourse(slug: $slug) {
      id title description instructor { name }
      modules {
        id title order
        lessons { id title duration videoUrl content }
      }
    }
    me { name }
  }
`;

const CoursePlayer = () => {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_COURSE, { variables: { slug } });
  const [activeLesson, setActiveLesson] = useState(null);

  if (loading) return <div className="text-center py-10">Loading course player...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading course!</div>;

  const course = data.getCourse;
  const userName = data.me?.name;

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-6rem)]">
      {/* Video & Content Area */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeLesson ? (
          <>
            <div className="w-full aspect-video bg-black flex items-center justify-center relative">
              {activeLesson.videoUrl ? (
                <span className="text-white">Video Player (Mock): {activeLesson.videoUrl}</span>
              ) : (
                <span className="text-gray-400">No video provided for this lesson</span>
              )}
            </div>
            <div className="p-6 overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{activeLesson.title}</h2>
              <div className="prose max-w-none text-gray-700">
                {activeLesson.content || 'No text content available.'}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h2>
            <p className="text-gray-500 max-w-lg">{course.description}</p>
            <p className="mt-6 text-brand-600 font-medium">Select a lesson from the sidebar to begin.</p>
          </div>
        )}
      </div>

      {/* Sidebar: Curriculum & Chat */}
      <div className="w-full lg:w-96 flex flex-col gap-4 h-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-bold text-lg">Course Curriculum</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {course.modules.map(module => (
              <div key={module.id} className="mb-4">
                <h4 className="font-bold text-gray-800 mb-2">{module.order}. {module.title}</h4>
                <div className="space-y-1">
                  {module.lessons.map(lesson => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLesson(lesson)}
                      className={`w-full text-left flex items-start gap-3 p-2 rounded-md transition ${activeLesson?.id === lesson.id ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      {lesson.videoUrl ? <PlayCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <FileText className="w-5 h-5 shrink-0 mt-0.5" />}
                      <div className="flex-1">
                        <p className="text-sm font-medium">{lesson.title}</p>
                        <p className="text-xs text-gray-400">{lesson.duration ? `${lesson.duration} min` : 'Reading'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-1/3 min-h-[250px]">
          <ChatWidget courseId={course.id} userName={userName} />
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
