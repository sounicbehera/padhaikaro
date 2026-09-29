import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import ChatWidget from '../components/ChatWidget';
import { Play, PlayCircle, FileText, CheckCircle, Search, Bell, Settings, Calendar, LayoutDashboard, Menu, GraduationCap, MessageSquare } from 'lucide-react';

const GET_COURSE = gql`
  query GetCourse($slug: String!) {
    getCourse(slug: $slug) {
      id title description instructor { name }
      modules {
        id title order
        lessons { id title duration videoUrl pdfUrl content }
      }
    }
    me { name }
  }
`;

const CoursePlayer = () => {
  const { slug } = useParams();
  const { loading, error, data } = useQuery(GET_COURSE, { variables: { slug } });
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeLessonView, setActiveLessonView] = useState('video');
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary text-xl">Loading course...</div></div>;
  if (error) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-error text-xl">Error loading course!</div></div>;

  const course = data.getCourse;
  const userName = data.me?.name || 'Student';

  // Set default lesson if none selected
  if (!activeLesson && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
    setActiveLesson(course.modules[0].lessons[0]);
  }

  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased selection:bg-primary-container selection:text-on-primary-container min-h-screen flex w-full">
      
      {/* Side Navigation */}
      <nav className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col h-full py-unit-lg bg-surface-container-lowest border-r border-white/10 fixed left-0 top-0 w-[280px] z-50`}>
        <div className="px-unit-lg mb-unit-xl flex items-center gap-unit-md cursor-pointer hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-[0_4px_20px_rgba(208,188,255,0.3)]">
            <GraduationCap className="text-on-primary font-bold h-6 w-6" />
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight leading-none mb-1">LMS Pro</h1>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">University Portal</p>
          </div>
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto px-unit-md pb-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-surface-variant [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-surface-variant/80">
          <div className="mb-4 mt-2">
            <h2 className="font-label-lg text-label-lg font-bold text-on-surface px-2">Course Content</h2>
            <p className="text-xs text-on-surface-variant px-2 mt-1">{course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0} lessons</p>
          </div>
          <div className="space-y-4">
            {course.modules?.map(module => (
              <div key={module.id} className="flex flex-col gap-1">
                <h4 className="font-bold text-on-surface mb-1 flex items-center gap-2 text-sm px-2">
                  <span className="bg-surface-variant text-on-surface px-1.5 py-0.5 rounded text-[10px]">Module {module.order}</span>
                  <span className="truncate">{module.title}</span>
                </h4>
                <div className="space-y-0.5">
                  {module.lessons?.map(lesson => (
                    <div key={lesson.id} className="flex flex-col">
                      <button
                        onClick={() => { setActiveLesson(lesson); setActiveLessonView('video'); }}
                        className={`w-full text-left flex items-center gap-2 p-2 rounded-md transition text-sm ${activeLesson?.id === lesson.id && activeLessonView === 'video' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
                      >
                        {lesson.videoUrl ? <PlayCircle className="w-4 h-4 shrink-0" /> : <PlayCircle className="w-4 h-4 shrink-0 opacity-50" />}
                        <span className="flex-1 truncate leading-tight">{lesson.title}</span>
                        {lesson.duration && <span className="text-[10px] opacity-70 shrink-0">{lesson.duration}m</span>}
                      </button>
                      
                      {lesson.pdfUrl && (
                        <button
                          onClick={() => { setActiveLesson(lesson); setActiveLessonView('pdf'); }}
                          className={`w-full text-left flex items-center gap-2 p-2 pl-6 rounded-md transition text-sm ${activeLesson?.id === lesson.id && activeLessonView === 'pdf' ? 'bg-primary/10 text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}
                        >
                          <FileText className="w-4 h-4 shrink-0 text-secondary" />
                          <span className="flex-1 truncate leading-tight">Course Material (PDF)</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-unit-md mt-auto">
          <a href="#" className="flex items-center gap-unit-md px-unit-md py-unit-sm rounded-lg text-on-surface-variant font-medium hover:bg-surface-variant/50 transition-colors duration-200 ease-in-out">
            <Settings className="w-5 h-5" />
            <span className="font-label-md text-label-md">Settings</span>
          </a>
          <Link to="/dashboard" className="mt-unit-lg px-unit-md pt-unit-md border-t border-white/5 flex items-center gap-unit-md cursor-pointer hover:bg-surface-variant/30 p-2 rounded-lg transition-colors">
            <div className="w-10 h-10 rounded-full border border-white/10 bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold uppercase">
              {userName.substring(0,2)}
            </div>
            <div className="overflow-hidden">
              <p className="font-label-md text-label-md text-on-surface truncate">{userName}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate opacity-70">Student</p>
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content Wrapper */}
      <div className="flex-grow flex flex-col w-full md:ml-[280px]">
        {/* Top Navbar */}
        <header className="flex justify-between items-center h-16 w-full px-margin-desktop bg-surface/60 backdrop-blur-xl border-b border-white/10 shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-unit-md">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors mr-2">
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center font-label-sm text-label-sm text-on-surface-variant tracking-wide">
              <Link to="/catalog" className="hover:text-primary transition-colors">Courses</Link>
              <span className="mx-1 opacity-50">&gt;</span>
              <span className="text-primary font-medium">{course.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-unit-lg">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors active:scale-95">
              <Search className="w-5 h-5" />
            </button>
            <div className="relative cursor-pointer active:scale-95 hover:opacity-80 transition-opacity">
              <Bell className="w-5 h-5 text-on-surface-variant" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full shadow-[0_0_8px_rgba(255,180,171,0.6)]"></span>
            </div>
          </div>
        </header>

        {/* Main Canvas */}
        <main className="flex-grow p-gutter md:p-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter max-w-container-max mx-auto w-full">
          
          {/* Left Column (Video & Info) */}
          <div className="lg:col-span-8 flex flex-col gap-unit-lg">
            
            {/* Player Container */}
            {activeLessonView === 'pdf' && activeLesson?.pdfUrl ? (
              <div className="w-full h-[500px] md:h-[700px] rounded-xl overflow-hidden border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] bg-surface-container">
                <iframe 
                  src={activeLesson.pdfUrl} 
                  title="Course PDF Material"
                  className="w-full h-full border-none bg-white"
                ></iframe>
              </div>
            ) : (
              <div className="glass-panel rounded-xl overflow-hidden relative group shadow-[0_20px_40px_rgba(0,0,0,0.4)] aspect-video bg-black flex items-center justify-center">
                {activeLesson?.videoUrl ? (
                  <div className="text-white">Video Player: {activeLesson.videoUrl}</div>
                ) : (
                  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCOllAnLqSBNQ-Wu14JynSqZ2nFyjPU8OAtcKb_SjC9O4MPOHJtGwJ5QZCRu1XVS1xHYUIjS94E50HGoUIBofnMWAG-xqFNG_8cetcV7SvlbTPo-BkwX9zKi3upK_cnO0EzQ3tH0foJCC9AaMlCBRoIvWVzZEynjpVF_I1S6Uv29-i5UTL0FL4aii_OmT30U4UE7g1ps5XL1QbLyZFmcitgSXfMJTJWHcT0FSxl-AMjVIoVqMFWRAIEAA')" }}></div>
                )}
                
                {!activeLesson?.videoUrl && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-between p-unit-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                      <div className="flex justify-between items-start">
                        <div className="bg-surface-container-high/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
                          <PlayCircle className="text-primary w-4 h-4 fill-current" />
                          <span className="font-label-sm text-label-sm text-on-surface font-medium">{activeLesson?.title || course.title}</span>
                        </div>
                      </div>
                      <div className="flex justify-center items-center flex-grow cursor-pointer group/play">
                        <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center backdrop-blur-md group-hover/play:bg-primary/40 group-hover/play:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(208,188,255,0.3)]">
                          <Play className="text-primary w-8 h-8 fill-current ml-1" />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Course Content Area */}
            <div className="flex flex-col gap-unit-lg">
              <div>
                <h2 className="font-headline-md text-headline-md font-semibold text-on-surface mb-2">{activeLesson?.title || course.title}</h2>
                <div className="flex items-center gap-unit-md font-label-sm text-label-sm text-on-surface-variant">
                  <span className="bg-surface-variant px-2 py-1 rounded text-on-surface">Instructor: {course.instructor.name}</span>
                  <span className="flex items-center gap-1"><PlayCircle className="w-4 h-4"/> {activeLesson?.duration || 0} mins</span>
                </div>
              </div>


              {/* Tabs */}
              <div className="border-b border-white/10 flex gap-unit-lg font-label-md text-label-md">
                <button 
                  onClick={() => setActiveTab('Overview')} 
                  className={`pb-2 px-1 relative transition-colors ${activeTab === 'Overview' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Overview
                  {activeTab === 'Overview' && <div className="absolute -bottom-[1px] left-0 w-full h-[2px] bg-primary shadow-[0_-2px_8px_rgba(208,188,255,0.6)] rounded-t-full"></div>}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'Overview' && (
                <div className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  <p>{activeLesson?.content || course.description}</p>
                </div>
              )}

            </div>
          </div>

          {/* Right Column (Chat) */}
          <div className="lg:col-span-4 h-[600px] lg:h-[calc(100vh-8rem)]">
            <div className="sticky top-24 h-full glass-panel rounded-xl border-t-[0.5px] border-t-white/10 flex flex-col overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              <div className="px-unit-md py-unit-md border-b border-white/10 bg-surface-container-high/50 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-primary w-5 h-5" />
                  <h3 className="font-label-md text-label-md text-on-surface font-semibold">Live Discussion</h3>
                </div>
                <div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full border border-tertiary/20">
                  <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_5px_var(--color-tertiary)] animate-pulse"></span>
                  Online
                </div>
              </div>
              <div className="flex-grow flex flex-col relative bg-surface-container/30">
                <ChatWidget courseId={course.id} userName={userName} />
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default CoursePlayer;
