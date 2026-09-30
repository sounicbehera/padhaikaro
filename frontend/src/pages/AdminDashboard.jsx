import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { Link, useNavigate } from 'react-router-dom';

const GET_MY_COURSES = gql`
  query GetMyCourses {
    getMyCourses {
      id
      title
      slug
      description
      price
      category
      isPublished
    }
  }
`;

const CREATE_COURSE = gql`
  mutation CreateCourse($title: String!, $slug: String!, $description: String, $price: Float, $category: String, $level: String) {
    createCourse(title: $title, slug: $slug, description: $description, price: $price, category: $category, level: $level) {
      id
      title
      slug
    }
  }
`;

const PUBLISH_COURSE = gql`
  mutation PublishCourse($courseId: ID!) {
    publishCourse(courseId: $courseId) {
      id
      isPublished
    }
  }
`;

const AdminDashboard = () => {
  const { loading, error, data, refetch } = useQuery(GET_MY_COURSES);
  const [createCourse, { loading: creating }] = useMutation(CREATE_COURSE);
  const [publishCourse] = useMutation(PUBLISH_COURSE);
  const navigate = useNavigate();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', slug: '', description: '', price: 0, category: 'General', level: 'Beginner' });

  if (loading) return <div className="text-center py-10 text-on-surface">Loading courses...</div>;
  if (error) return <div className="text-center py-10 text-error">Error: {error.message}</div>;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await createCourse({ variables: { ...formData, price: parseFloat(formData.price) } });
      setShowForm(false);
      refetch();
      navigate(`/admin/course/${res.data.createCourse.slug}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePublish = async (courseId) => {
    try {
      await publishCourse({ variables: { courseId } });
      refetch();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Instructor Dashboard</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/admin/quizzes')}
            className="px-4 py-2 bg-surface-variant text-on-surface-variant rounded-md font-medium hover:bg-surface-variant/80 transition"
          >
            Manage Quizzes
          </button>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-on-primary rounded-md font-medium hover:bg-primary/90 transition"
          >
            {showForm ? 'Cancel' : 'Create New Course'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-surface-container p-6 rounded-xl border border-outline-variant mb-8">
          <h2 className="text-xl font-bold text-on-surface mb-4">Create Course</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Title</label>
                <input required type="text" className="w-full bg-surface text-on-surface p-2 rounded border border-outline focus:outline-none focus:border-primary" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Slug</label>
                <input required type="text" className="w-full bg-surface text-on-surface p-2 rounded border border-outline focus:outline-none focus:border-primary" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Price ($)</label>
                <input required type="number" step="0.01" className="w-full bg-surface text-on-surface p-2 rounded border border-outline focus:outline-none focus:border-primary" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Category</label>
                <input required type="text" className="w-full bg-surface text-on-surface p-2 rounded border border-outline focus:outline-none focus:border-primary" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                <textarea rows="3" className="w-full bg-surface text-on-surface p-2 rounded border border-outline focus:outline-none focus:border-primary" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button disabled={creating} type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-md font-medium hover:bg-primary/90 transition disabled:opacity-50">
                {creating ? 'Creating...' : 'Save & Continue'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.getMyCourses.map(course => (
          <div key={course.id} className="bg-surface-container rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
            <div className="p-6 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-primary-container text-on-primary-container">
                  {course.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded font-bold ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2">{course.title}</h3>
              <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{course.description}</p>
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-variant/30 flex justify-between gap-2">
              <Link to={`/admin/course/${course.slug}`} className="flex-1 text-center py-2 bg-surface border border-outline text-on-surface rounded font-medium hover:bg-surface-variant transition">
                Edit Content
              </Link>
              {!course.isPublished && (
                <button onClick={() => handlePublish(course.id)} className="flex-1 py-2 bg-primary text-on-primary rounded font-medium hover:bg-primary/90 transition">
                  Publish
                </button>
              )}
            </div>
          </div>
        ))}
        {data.getMyCourses.length === 0 && (
          <div className="col-span-3 text-center py-10 text-on-surface-variant border-2 border-dashed border-outline-variant rounded-xl">
            You haven't created any courses yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
