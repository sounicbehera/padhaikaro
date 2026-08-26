import React from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';

const GET_COURSES = gql`
  query GetCourses {
    getCourses {
      id
      title
      slug
      description
      price
      category
      level
      instructor { name }
    }
  }
`;

const ENROLL_STUDENT = gql`
  mutation EnrollStudent($courseId: ID!) {
    enrollStudent(courseId: $courseId) { id }
  }
`;

const Catalog = () => {
  const { loading, error, data } = useQuery(GET_COURSES);
  const [enroll, { loading: enrollLoading }] = useMutation(ENROLL_STUDENT);
  const navigate = useNavigate();

  if (loading) return <div className="text-center py-10">Loading courses...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error loading courses!</div>;

  const handleEnroll = async (courseId, slug) => {
    try {
      if (!localStorage.getItem('token')) {
        navigate('/auth');
        return;
      }
      await enroll({ variables: { courseId } });
      navigate(`/course/${slug}`);
    } catch (err) {
      if (err.message === 'Already enrolled') {
        navigate(`/course/${slug}`);
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Course Catalog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.getCourses.map(course => (
          <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-brand-100 text-brand-800">
                  {course.category || 'General'}
                </span>
                <span className="font-bold text-gray-900">${course.price || 'Free'}</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <span>By {course.instructor.name}</span>
                <span className="mx-2">•</span>
                <span>{course.level}</span>
              </div>
              <button 
                onClick={() => handleEnroll(course.id, course.slug)}
                disabled={enrollLoading}
                className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium transition"
              >
                Enroll Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
