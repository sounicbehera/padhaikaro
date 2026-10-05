import React, { useState, useRef } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';
import { useParams, Link } from 'react-router-dom';

const GET_COURSE_DETAILS = gql`
  query GetCourseDetails($slug: String!) {
    getCourse(slug: $slug) {
      id
      title
      slug
      modules {
        id
        title
        order
        lessons {
          id
          title
          videoUrl
          pdfUrl
        }
      }
    }
  }
`;

const CREATE_MODULE = gql`
  mutation CreateModule($courseId: ID!, $title: String!, $order: Int!) {
    createModule(courseId: $courseId, title: $title, order: $order) {
      id
      title
      order
    }
  }
`;

const UPDATE_MODULE = gql`
  mutation UpdateModule($moduleId: ID!, $title: String!) {
    updateModule(moduleId: $moduleId, title: $title) {
      id
      title
    }
  }
`;

const DELETE_MODULE = gql`
  mutation DeleteModule($courseId: ID!, $moduleId: ID!) {
    deleteModule(courseId: $courseId, moduleId: $moduleId)
  }
`;

const CREATE_LESSON = gql`
  mutation CreateLesson($moduleId: ID!, $title: String!, $content: String, $videoUrl: String, $pdfUrl: String) {
    createLesson(moduleId: $moduleId, title: $title, content: $content, videoUrl: $videoUrl, pdfUrl: $pdfUrl) {
      id
      title
      videoUrl
      pdfUrl
    }
  }
`;

const UPDATE_LESSON = gql`
  mutation UpdateLesson($lessonId: ID!, $title: String, $videoUrl: String, $pdfUrl: String, $content: String) {
    updateLesson(lessonId: $lessonId, title: $title, videoUrl: $videoUrl, pdfUrl: $pdfUrl, content: $content) {
      id
      title
      videoUrl
      pdfUrl
    }
  }
`;

const DELETE_LESSON = gql`
  mutation DeleteLesson($moduleId: ID!, $lessonId: ID!) {
    deleteLesson(moduleId: $moduleId, lessonId: $lessonId)
  }
`;

const UPLOAD_MEDIA = gql`
  mutation UploadMedia($base64Data: String!, $mediaType: String!) {
    uploadMedia(base64Data: $base64Data, mediaType: $mediaType)
  }
`;

const AdminCourseEditor = () => {
    const { slug } = useParams();
    const { loading, error, data, refetch } = useQuery(GET_COURSE_DETAILS, { variables: { slug } });

    const [createModule] = useMutation(CREATE_MODULE);
    const [updateModule] = useMutation(UPDATE_MODULE);
    const [deleteModule] = useMutation(DELETE_MODULE);
    const [createLesson] = useMutation(CREATE_LESSON);
    const [updateLesson] = useMutation(UPDATE_LESSON);
    const [deleteLesson] = useMutation(DELETE_LESSON);
    const [uploadMedia, { loading: uploading }] = useMutation(UPLOAD_MEDIA);

    const [moduleTitle, setModuleTitle] = useState('');
    const [activeModule, setActiveModule] = useState(null);
    const [editingModuleId, setEditingModuleId] = useState(null);
    const [editModuleTitle, setEditModuleTitle] = useState('');

    const [editingLessonId, setEditingLessonId] = useState(null);
    const [lessonData, setLessonData] = useState({ title: '', videoUrl: '', pdfUrl: '', content: '' });

    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('');

    if (loading) return <div className="text-center py-10 text-on-surface">Loading course...</div>;
    if (error || !data.getCourse) return <div className="text-center py-10 text-error">Error loading course</div>;

    const course = data.getCourse;

    const handleFileUpload = (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        setUploadProgress(0);
        setUploadStatus('Reading file...');

        const reader = new FileReader();
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentLoaded = Math.round((event.loaded / event.total) * 40); // Reading takes up to 40%
                setUploadProgress(percentLoaded);
            }
        };

        reader.onload = async () => {
            setUploadProgress(40);
            setUploadStatus('Uploading to cloud... Please wait.');
            
            // Simulate progress for the network upload portion
            const interval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 95) return 95;
                    return prev + (Math.random() * 5); // Increment by up to 5% randomly
                });
            }, 800);

            try {
                const res = await uploadMedia({ variables: { base64Data: reader.result, mediaType: type } });
                clearInterval(interval);
                setUploadProgress(100);
                setUploadStatus('Upload Complete!');
                
                setTimeout(() => {
                    setIsUploading(false);
                }, 1000);

                if (type === 'video') {
                    setLessonData(prev => ({ ...prev, videoUrl: res.data.uploadMedia }));
                } else {
                    setLessonData(prev => ({ ...prev, pdfUrl: res.data.uploadMedia }));
                }
            } catch (err) {
                clearInterval(interval);
                setIsUploading(false);
                alert('Upload failed: ' + err.message);
            }
        };
        reader.onerror = () => {
            setIsUploading(false);
            alert('Failed to read file');
        };
        reader.readAsDataURL(file);
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        try {
            await createModule({
                variables: {
                    courseId: course.id,
                    title: moduleTitle,
                    order: course.modules.length + 1
                }
            });
            setModuleTitle('');
            refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateModule = async (moduleId) => {
        try {
            await updateModule({ variables: { moduleId, title: editModuleTitle } });
            setEditingModuleId(null);
            refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteModule = async (moduleId) => {
        if (!confirm('Are you sure you want to delete this module?')) return;
        try {
            await deleteModule({ variables: { courseId: course.id, moduleId } });
            refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            if (editingLessonId) {
                await updateLesson({
                    variables: {
                        lessonId: editingLessonId,
                        ...lessonData
                    }
                });
                setEditingLessonId(null);
            } else {
                await createLesson({
                    variables: {
                        moduleId: activeModule,
                        ...lessonData
                    }
                });
            }
            setLessonData({ title: '', videoUrl: '', pdfUrl: '', content: '' });
            setActiveModule(null);
            refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleDeleteLesson = async (moduleId, lessonId) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;
        try {
            await deleteLesson({ variables: { moduleId, lessonId } });
            refetch();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="max-w-4xl mx-auto relative">
            {isUploading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
                    <div className="bg-surface-container-high p-8 rounded-2xl shadow-2xl border border-outline-variant w-96 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full border-4 border-surface-variant border-t-primary animate-spin mb-6"></div>
                        <h3 className="text-xl font-bold text-on-surface mb-2">Uploading Media</h3>
                        <p className="text-sm text-on-surface-variant mb-6 text-center">{uploadStatus}</p>
                        
                        <div className="w-full bg-surface-variant rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                            <div 
                                className="bg-primary h-3 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                        <p className="text-sm font-bold text-primary">{Math.round(uploadProgress)}%</p>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <Link to="/admin" className="text-primary hover:underline mb-2 inline-block">← Back to Dashboard</Link>
                <h1 className="text-3xl font-bold text-on-surface">Editing: {course.title}</h1>
            </div>

            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant mb-8">
                <h2 className="text-xl font-bold text-on-surface mb-4">Add Module</h2>
                <form onSubmit={handleAddModule} className="flex gap-4">
                    <input
                        required
                        type="text"
                        placeholder="Module Title (e.g., Section 1: Introduction)"
                        className="flex-grow bg-surface text-on-surface p-2 rounded border border-outline focus:outline-none focus:border-primary"
                        value={moduleTitle}
                        onChange={e => setModuleTitle(e.target.value)}
                    />
                    <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded font-medium hover:bg-primary/90 transition">
                        Add Module
                    </button>
                </form>
            </div>

            <div className="space-y-6">
                {course.modules.map(module => (
                    <div key={module.id} className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
                        <div className="p-4 bg-surface-variant/30 flex justify-between items-center border-b border-outline-variant">
                            {editingModuleId === module.id ? (
                                <div className="flex gap-2 flex-grow mr-4">
                                    <input type="text" className="flex-grow bg-surface text-on-surface p-1 px-2 rounded border border-outline focus:outline-none focus:border-primary text-sm" value={editModuleTitle} onChange={e => setEditModuleTitle(e.target.value)} />
                                    <button onClick={() => handleUpdateModule(module.id)} className="bg-primary text-on-primary px-3 py-1 rounded text-sm font-medium">Save</button>
                                    <button onClick={() => setEditingModuleId(null)} className="text-on-surface-variant px-2 py-1 rounded text-sm hover:bg-surface-variant">Cancel</button>
                                </div>
                            ) : (
                                <h3 className="font-bold text-on-surface text-lg">{module.title}</h3>
                            )}

                            <div className="flex items-center gap-2">
                                {editingModuleId !== module.id && (
                                    <>
                                        <button onClick={() => { setEditingModuleId(module.id); setEditModuleTitle(module.title); }} className="text-xs font-medium text-on-surface-variant hover:text-primary px-2 py-1">Edit</button>
                                        <button onClick={() => handleDeleteModule(module.id)} className="text-xs font-medium text-on-surface-variant hover:text-error px-2 py-1">Delete</button>
                                    </>
                                )}
                                <button
                                    onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                                    className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1 rounded ml-2"
                                >
                                    + Add Lesson
                                </button>
                            </div>
                        </div>

                        {activeModule === module.id && (
                            <div className="p-4 border-b border-outline-variant bg-surface">
                                <form onSubmit={handleAddLesson} className="space-y-3">
                                    <input required type="text" placeholder="Lesson Title" className="w-full bg-surface-container text-on-surface p-2 rounded border border-outline text-sm focus:outline-none focus:border-primary" value={lessonData.title} onChange={e => setLessonData({ ...lessonData, title: e.target.value })} />
                                    
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-on-surface-variant font-medium">Video URL (or upload)</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="url" placeholder="Video URL" className="flex-grow bg-surface-container text-on-surface p-2 rounded border border-outline text-sm focus:outline-none focus:border-primary" value={lessonData.videoUrl} onChange={e => setLessonData({ ...lessonData, videoUrl: e.target.value })} />
                                            <label className={`cursor-pointer bg-surface-variant hover:bg-surface text-on-surface px-3 py-2 rounded text-sm whitespace-nowrap ${uploading ? 'opacity-50' : ''}`}>
                                                Upload Video
                                                <input type="file" accept="video/*" className="hidden" onChange={e => handleFileUpload(e, 'video')} disabled={uploading} />
                                            </label>
                                            {lessonData.videoUrl && (
                                                <button type="button" onClick={() => setLessonData({ ...lessonData, videoUrl: '' })} className="text-error text-sm px-2 hover:underline">Remove</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-on-surface-variant font-medium">PDF Document URL (or upload)</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="url" placeholder="PDF URL" className="flex-grow bg-surface-container text-on-surface p-2 rounded border border-outline text-sm focus:outline-none focus:border-primary" value={lessonData.pdfUrl} onChange={e => setLessonData({ ...lessonData, pdfUrl: e.target.value })} />
                                            <label className={`cursor-pointer bg-surface-variant hover:bg-surface text-on-surface px-3 py-2 rounded text-sm whitespace-nowrap ${uploading ? 'opacity-50' : ''}`}>
                                                Upload PDF
                                                <input type="file" accept="application/pdf" className="hidden" onChange={e => handleFileUpload(e, 'pdf')} disabled={uploading} />
                                            </label>
                                            {lessonData.pdfUrl && (
                                                <button type="button" onClick={() => setLessonData({ ...lessonData, pdfUrl: '' })} className="text-error text-sm px-2 hover:underline">Remove</button>
                                            )}
                                        </div>
                                    </div>

                                    <textarea placeholder="Text Content or Notes" rows="2" className="w-full bg-surface-container text-on-surface p-2 rounded border border-outline text-sm focus:outline-none focus:border-primary" value={lessonData.content} onChange={e => setLessonData({ ...lessonData, content: e.target.value })}></textarea>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => { setActiveModule(null); setEditingLessonId(null); setLessonData({ title: '', videoUrl: '', pdfUrl: '', content: '' }); }} className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant rounded text-sm font-medium transition">Cancel</button>
                                        <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded text-sm font-medium hover:bg-primary/90 transition">{editingLessonId ? 'Update Lesson' : 'Save Lesson'}</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="p-0">
                            {module.lessons.map((lesson, idx) => (
                                <div key={lesson.id} className="p-4 border-b last:border-b-0 border-outline-variant flex items-center justify-between hover:bg-surface-variant/20 transition">
                                    <div className="flex items-center gap-3">
                                        <span className="text-on-surface-variant font-medium text-sm">{idx + 1}.</span>
                                        <span className="text-on-surface font-medium">{lesson.title}</span>
                                        <div className="flex gap-2 ml-2">
                                            {lesson.videoUrl && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Video</span>}
                                            {lesson.pdfUrl && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">PDF</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity" style={{ opacity: 1 }}>
                                        <button
                                            onClick={() => {
                                                setEditingLessonId(lesson.id);
                                                setActiveModule(module.id);
                                                setLessonData({
                                                    title: lesson.title,
                                                    videoUrl: lesson.videoUrl || '',
                                                    pdfUrl: lesson.pdfUrl || '',
                                                    content: lesson.content || ''
                                                });
                                            }}
                                            className="text-xs font-medium text-on-surface-variant hover:text-primary px-2 py-1"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLesson(module.id, lesson.id)}
                                            className="text-xs font-medium text-on-surface-variant hover:text-error px-2 py-1"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {module.lessons.length === 0 && (
                                <div className="p-4 text-sm text-on-surface-variant text-center">No lessons added yet.</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCourseEditor;