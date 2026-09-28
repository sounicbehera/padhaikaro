import React, { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useNavigate } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id name role }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!, $role: String) {
    register(name: $name, email: $email, password: $password, role: $role) {
      token
      user { id name role }
    }
  }
`;

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
    const navigate = useNavigate();

    const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            localStorage.setItem('token', data.login.token);
            navigate('/catalog');
        }
    });

    const [register, { loading: regLoading, error: regError }] = useMutation(REGISTER_MUTATION, {
        onCompleted: (data) => {
            localStorage.setItem('token', data.register.token);
            navigate('/catalog');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            login({ variables: { email: formData.email, password: formData.password } });
        } else {
            register({ variables: formData });
        }
    };

    return (
        <div className="bg-background text-on-background min-h-screen flex antialiased w-full">
            {/* Left Side: Branding & Testimonial */}
            <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-10 lg:p-16 relative overflow-hidden bg-surface-container-lowest border-r border-white/10">
                {/* Abstract Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary-container),_var(--color-background))] pointer-events-none"></div>
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#d0bcff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

                {/* Header */}
                <div className="relative z-10 flex items-center gap-unit-sm">
                    <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>integration_instructions</span>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">LMS Pro</span>
                </div>

                {/* Testimonial */}
                <div className="relative z-10 max-w-md">
                    <div className="bg-surface-container/60 backdrop-blur-xl p-unit-lg rounded-lg border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
                        <p className="font-body-lg text-body-lg text-on-surface mb-unit-md italic">
                            "The most focused learning experience I've ever used. The interface gets out of the way so I can concentrate on mastering complex engineering concepts."
                        </p>
                        <div className="flex items-center gap-unit-md">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-surface-variant">
                                <img alt="Sarah J." className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAbeKg2O1uEcGA4n5EKPqyZpxIIWBbuOE7dsWZ_nAlxT4LZlumO_CCvsykY9raVdKb1gPcr4iCY2Cx4M9cCANtyCt6Cl3kEMjF1acNl2XRbQIPSHzvUbMFvhOLTAin7REJRhinRWEGnnbndhNrOQGHeRV7D16MuWy6SPMaAkkLC3tPWuAfn2qgGwBfl14-9oDVQji_J8rQAQ8c58YVQE-dVwZSTBJk0bCaLfWOzTvtBCFCkOZ3hp8VZFw" />
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-on-surface font-bold">Sarah J.</p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">Senior Engineer</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative z-10">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 LMS Pro. All rights reserved.</p>
                </div>
            </div>

            {/* Right Side: Auth Form */}
            <div className="w-full flex-1 flex flex-col items-center justify-center p-8 lg:p-12 bg-background relative">
                <div className="w-full max-w-md mx-auto z-10">
                    {/* Mobile Branding */}
                    <div className="flex lg:hidden items-center justify-center gap-unit-sm mb-unit-xl">
                        <span className="material-symbols-outlined text-primary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>integration_instructions</span>
                        <span className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">LMS Pro</span>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-surface-variant mb-unit-lg">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`w-1/2 flex justify-center items-center py-unit-sm font-label-md text-label-md text-center border-b-2 transition-colors ${isLogin ? 'font-bold text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`w-1/2 flex justify-center items-center py-unit-sm font-label-md text-label-md text-center border-b-2 transition-colors ${!isLogin ? 'font-bold text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Form */}
                    <form className="space-y-unit-md" onSubmit={handleSubmit}>
                        <div className="space-y-unit-lg">
                            {!isLogin && (
                                <div className="relative">
                                    <input
                                        id="name"
                                        type="text"
                                        required
                                        placeholder="Full Name"
                                        className="peer w-full bg-[#1E1E1E] text-on-surface font-body-md text-body-md px-4 pt-6 pb-2 rounded border border-outline-variant placeholder-transparent input-glow focus:outline-none transition-all"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                    <label htmlFor="name" className="absolute left-4 top-2 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:font-body-md peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:font-label-sm peer-focus:text-label-sm peer-focus:text-primary pointer-events-none">Full Name</label>
                                </div>
                            )}

                            <div className="relative">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    placeholder="Email"
                                    className="peer w-full bg-[#1E1E1E] text-on-surface font-body-md text-body-md px-4 pt-6 pb-2 rounded border border-outline-variant placeholder-transparent input-glow focus:outline-none transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                                <label htmlFor="email" className="absolute left-4 top-2 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:font-body-md peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:font-label-sm peer-focus:text-label-sm peer-focus:text-primary pointer-events-none">Email Address</label>
                            </div>

                            <div className="relative">
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    placeholder="Password"
                                    className="peer w-full bg-[#1E1E1E] text-on-surface font-body-md text-body-md px-4 pt-6 pb-2 rounded border border-outline-variant placeholder-transparent input-glow focus:outline-none transition-all"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <label htmlFor="password" className="absolute left-4 top-2 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:font-body-md peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:font-label-sm peer-focus:text-label-sm peer-focus:text-primary pointer-events-none">Password</label>
                            </div>

                            {!isLogin && (
                                <div className="relative">
                                    <select
                                        className="peer w-full bg-[#1E1E1E] text-on-surface font-body-md text-body-md px-4 pt-6 pb-2 rounded border border-outline-variant input-glow focus:outline-none transition-all appearance-none"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Instructor">Instructor</option>
                                    </select>
                                    <label className="absolute left-4 top-2 font-label-sm text-label-sm text-primary pointer-events-none">Role</label>
                                </div>
                            )}
                        </div>

                        {loginError && <p className="text-error font-body-sm text-body-sm mt-2">{loginError.message}</p>}
                        {regError && <p className="text-error font-body-sm text-body-sm mt-2">{regError.message}</p>}

                        <div className="flex justify-end pt-unit-xs">
                            <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors" href="#">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loginLoading || regLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-container text-background font-label-md text-label-md py-3 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-unit-md shadow-sm disabled:opacity-50"
                        >
                            {isLogin ? 'Log In' : 'Sign Up'}
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </form>

                    <div className="relative flex items-center py-unit-lg">
                        <div className="flex-grow border-t border-surface-variant"></div>
                        <span className="flex-shrink-0 mx-4 font-label-sm text-label-sm text-on-surface-variant">OR</span>
                        <div className="flex-grow border-t border-surface-variant"></div>
                    </div>

                    {/* Social Auth */}
                    <div className="space-y-unit-sm">
                        <button className="w-full bg-transparent border border-white/10 text-on-surface font-label-md text-label-md py-3 rounded flex items-center justify-center gap-3 hover:bg-surface-variant/50 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                            </svg>
                            Sign in with Google
                        </button>
                        <button className="w-full bg-transparent border border-white/10 text-on-surface font-label-md text-label-md py-3 rounded flex items-center justify-center gap-3 hover:bg-surface-variant/50 transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.49 0-.24-.01-.88-.01-1.74-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.54 2.36 1.1 2.93.84.09-.65.35-1.1.64-1.35-2.22-.25-4.55-1.11-4.55-4.92 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85 0 1.34-.01 2.42-.01 2.75 0 .26.15.58.67.48C19.14 20.16 22 16.42 22 12c0-5.523-4.477-10-10-10z" fill="currentColor" fillRule="evenodd"></path>
                            </svg>
                            Sign in with GitHub
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;