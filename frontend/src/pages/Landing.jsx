import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Sparkles, Code, Terminal, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="relative min-h-screen bg-background text-on-background flex flex-col">
      {/* Background Mesh Gradient Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-tertiary/10 blur-[120px]"></div>
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full bg-secondary/15 blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navigation - Transparent */}
      <nav className="w-full z-50 glass-nav border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
                <BookOpen className="h-6 w-6 text-on-primary font-bold" />
              </div>
              <span className="font-headline-md text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">LMS Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth" className="hidden md:inline-flex items-center text-on-surface-variant hover:text-white transition-colors font-medium">
                Log In
              </Link>
              <Link to="/auth" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Sign In / Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col justify-center items-center relative z-10 min-h-[calc(100vh-80px)] py-[10vh]">
        <div className="relative max-w-[1200px] w-full mx-auto flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-surface-variant/50 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-label-md text-on-surface-variant">Introducing the next generation learning platform</span>
          </div>
          
          <h1 className="font-headline-lg font-extrabold tracking-tight mb-6 md:mb-8 w-full animate-fade-in-up animation-delay-100"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)', lineHeight: '1.1' }}>
            Master your craft with <br className="hidden md:block"/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
              precision & focus
            </span>
          </h1>
          
          <p className="font-body-lg text-lg md:text-xl text-on-surface-variant max-w-2xl mb-10 md:mb-12 animate-fade-in-up animation-delay-200">
            An immersive, distraction-free environment designed for engineers. 
            Build complex projects, master new languages, and accelerate your career.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up animation-delay-300 w-full sm:w-auto">
            <Link to="/auth" className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-full bg-gradient-to-r from-primary to-primary-container text-background font-bold text-base md:text-lg hover:opacity-90 transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(208,188,255,0.4)] flex items-center justify-center gap-2">
              Start Learning Now
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/auth" className="w-full sm:w-auto px-6 py-3 md:px-8 md:py-4 rounded-full bg-surface-variant/30 border border-white/10 text-white font-medium text-base md:text-lg hover:bg-surface-variant/50 transition-all flex items-center justify-center">
              Sign In to Account
            </Link>
          </div>

          {/* Floating elements anchored to the 1200px container */}
          <div className="absolute top-[10%] -left-4 lg:-left-12 p-3 md:p-4 rounded-2xl bg-surface-container/40 backdrop-blur-xl border border-white/10 shadow-2xl animate-float hidden md:block">
            <Code className="w-6 h-6 md:w-8 md:h-8 text-secondary" />
          </div>
          <div className="absolute bottom-[10%] -right-4 lg:-right-12 p-3 md:p-4 rounded-2xl bg-surface-container/40 backdrop-blur-xl border border-white/10 shadow-2xl animate-float animation-delay-500 hidden md:block">
            <Terminal className="w-6 h-6 md:w-8 md:h-8 text-tertiary" />
          </div>
        </div>
      </main>

      {/* Courses Section */}
      <section className="w-full relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-surface-container-lowest border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="font-headline-md text-3xl md:text-4xl font-bold mb-4">Popular Courses</h2>
            <p className="font-body-md text-lg text-on-surface-variant max-w-2xl mx-auto">
              Get started with our most in-demand engineering tracks.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Advanced Java', desc: 'Master JVM, multithreading, and Spring Boot.', color: 'from-orange-500 to-red-500' },
              { title: 'Python Mastery', desc: 'Learn Pandas, NumPy, and Machine Learning.', color: 'from-blue-400 to-indigo-500' },
              { title: 'C Systems', desc: 'Low-level memory management and pointers.', color: 'from-gray-400 to-gray-600' },
              { title: 'MongoDB Pro', desc: 'Design scalable document databases.', color: 'from-green-400 to-emerald-600' }
            ].map((course, idx) => (
              <Link 
                key={idx} 
                to="/auth" 
                className="group relative p-8 rounded-3xl bg-surface-container/40 border border-white/10 hover:border-white/20 hover:bg-surface-container-high/60 transition-all duration-300 flex flex-col items-start gap-4 hover:-translate-y-2 shadow-lg hover:shadow-2xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg`}>
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="mt-2">
                  <h3 className="font-headline-sm text-xl font-bold text-on-surface mb-3 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="font-body-sm text-on-surface-variant leading-relaxed">
                    {course.desc}
                  </p>
                </div>
                <div className="mt-auto pt-6 flex items-center gap-1 text-primary font-label-sm text-sm font-bold group-hover:gap-3 transition-all">
                  Start Course <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Styles for animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-100 { animation-delay: 100ms; }
        .animation-delay-200 { animation-delay: 200ms; }
        .animation-delay-300 { animation-delay: 300ms; }
        .animation-delay-500 { animation-delay: 500ms; }
      `}} />
    </div>
  );
};

export default Landing;
