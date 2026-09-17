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

const GET_MY_ENROLLMENTS = gql`
  query GetMyEnrollments {
    getMyEnrollments {
      id
      course {
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
  }
`;

const ENROLL_STUDENT = gql`
  mutation EnrollStudent($courseId: ID!) {
    enrollStudent(courseId: $courseId) { id }
  }
`;

const Catalog = () => {
  const token = localStorage.getItem('token');
  const { loading: coursesLoading, error: coursesError, data: coursesData } = useQuery(GET_COURSES);
  const { loading: enrollmentsLoading, error: enrollmentsError, data: enrollmentsData } = useQuery(GET_MY_ENROLLMENTS, { skip: !token });
  
  const [enroll, { loading: enrollLoading }] = useMutation(ENROLL_STUDENT);
  const navigate = useNavigate();

  if (coursesLoading || enrollmentsLoading) return <div className="text-center py-10">Loading courses...</div>;
  
  if (coursesError) return <div className="text-center py-10 text-red-500">Error loading courses: {coursesError.message}</div>;

  const courses = coursesData?.getCourses || [];
  const enrolledCourses = enrollmentsData?.getMyEnrollments?.map(e => e.course) || [];
  const enrolledCourseIds = new Set(enrolledCourses.map(c => c.id));
  
  const availableCourses = courses.filter(c => !enrolledCourseIds.has(c.id));

  const handleEnroll = async (courseId, slug) => {
    try {
      if (!token) {
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

  const CourseCard = ({ course, isEnrolled }) => (
    <div key={course.id} className="bg-surface-container rounded-xl shadow-sm border border-outline-variant overflow-hidden hover:shadow-md transition">
      <div className="h-48 bg-surface-variant flex items-center justify-center">
        <span className="text-on-surface-variant">No Image</span>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary-container text-on-primary-container">
            {course.category || 'General'}
          </span>
          <span className="font-bold text-on-surface">${course.price || 'Free'}</span>
        </div>
        <h3 className="text-xl font-bold text-on-surface mb-2">{course.title}</h3>
        <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="flex items-center text-sm text-on-surface-variant mb-4">
          <span>By {course.instructor?.name || 'Unknown'}</span>
          <span className="mx-2">•</span>
          <span>{course.level || 'All Levels'}</span>
        </div>
        {isEnrolled ? (
          <button 
            onClick={() => navigate(`/course/${course.slug}`)}
            className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition"
          >
            Continue Course
          </button>
        ) : (
          <button 
            onClick={() => handleEnroll(course.id, course.slug)}
            disabled={enrollLoading}
            className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md font-medium transition disabled:opacity-50"
          >
            Enroll Now
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-on-surface">Dashboard</h1>
      
      {token && enrolledCourses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-on-surface">My Enrolled Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={true} />)}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold mb-6 text-on-surface">{token && enrolledCourses.length > 0 ? "More Courses You Might Like" : "Course Catalog"}</h2>
        {availableCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCourses.map(course => <CourseCard key={course.id} course={course} isEnrolled={false} />)}
          </div>
        ) : (
          <p className="text-on-surface-variant">No more courses available right now.</p>
        )}
      </div>
    </div>
  );
};

export default Catalog;
