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

const VERIFY_OTP_MUTATION = gql`
  mutation VerifyOTP($email: String!, $otp: String!) {
    verifyOTP(email: $email, otp: $otp) {
      token
      user { id name role }
    }
  }
`;

const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($email: String!, $otp: String!, $newPassword: String!) {
    resetPassword(email: $email, otp: $otp, newPassword: $newPassword)
  }
`;

const Auth = () => {
    const [view, setView] = useState('login'); // 'login', 'register', 'verify', 'forgot', 'reset'
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
    const navigate = useNavigate();

    const [login, { loading: loginLoading, error: loginError }] = useMutation(LOGIN_MUTATION, {
        onCompleted: (data) => {
            sessionStorage.setItem('token', data.login.token);
            navigate('/catalog');
        },
        onError: (err) => {
            if (err.message.includes('verify your email')) {
                setView('verify');
            }
        }
    });

    const [register, { loading: regLoading, error: regError }] = useMutation(REGISTER_MUTATION, {
        onCompleted: (data) => {
            setView('verify');
        }
    });

    const [verifyOTP, { loading: verifyLoading, error: verifyError }] = useMutation(VERIFY_OTP_MUTATION, {
        onCompleted: (data) => {
            sessionStorage.setItem('token', data.verifyOTP.token);
            navigate('/catalog');
        }
    });

    const [forgotPassword, { loading: forgotLoading, error: forgotError }] = useMutation(FORGOT_PASSWORD_MUTATION, {
        onCompleted: () => {
            setView('reset');
        }
    });

    const [resetPassword, { loading: resetLoading, error: resetError }] = useMutation(RESET_PASSWORD_MUTATION, {
        onCompleted: () => {
            setView('login');
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (view === 'login') {
            login({ variables: { email: formData.email, password: formData.password } });
        } else if (view === 'register') {
            register({ variables: formData });
        } else if (view === 'verify') {
            verifyOTP({ variables: { email: formData.email, otp: formData.otp } });
        } else if (view === 'forgot') {
            forgotPassword({ variables: { email: formData.email } });
        } else if (view === 'reset') {
            resetPassword({ variables: { email: formData.email, otp: formData.otp, newPassword: formData.password } });
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
                    {(view === 'login' || view === 'register') && (
                        <div className="flex border-b border-surface-variant mb-unit-lg">
                            <button
                                onClick={() => setView('login')}
                                className={`w-1/2 flex justify-center items-center py-unit-sm font-label-md text-label-md text-center border-b-2 transition-colors ${view === 'login' ? 'font-bold text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'}`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setView('register')}
                                className={`w-1/2 flex justify-center items-center py-unit-sm font-label-md text-label-md text-center border-b-2 transition-colors ${view === 'register' ? 'font-bold text-primary border-primary' : 'text-on-surface-variant hover:text-on-surface border-transparent'}`}
                            >
                                Create Account
                            </button>
                        </div>
                    )}
                    
                    {view === 'verify' && (
                        <div className="text-center mb-unit-lg">
                            <h2 className="font-headline-sm text-primary mb-2">Verify Your Email</h2>
                            <p className="text-on-surface-variant">We've sent an OTP to {formData.email}</p>
                        </div>
                    )}

                    {view === 'forgot' && (
                        <div className="text-center mb-unit-lg">
                            <h2 className="font-headline-sm text-primary mb-2">Reset Password</h2>
                            <p className="text-on-surface-variant">Enter your email to receive an OTP.</p>
                        </div>
                    )}

                    {view === 'reset' && (
                        <div className="text-center mb-unit-lg">
                            <h2 className="font-headline-sm text-primary mb-2">Set New Password</h2>
                            <p className="text-on-surface-variant">Enter the OTP sent to your email and your new password.</p>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-unit-md" onSubmit={handleSubmit}>
                        <div className="space-y-unit-lg">
                            {view === 'register' && (
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

                            {(view === 'login' || view === 'register' || view === 'forgot' || view === 'verify' || view === 'reset') && (
                                <div className="relative">
                                    <input
                                        id="email"
                                        type="email"
                                        required
                                        placeholder="Email"
                                        className="peer w-full bg-[#1E1E1E] text-on-surface font-body-md text-body-md px-4 pt-6 pb-2 rounded border border-outline-variant placeholder-transparent input-glow focus:outline-none transition-all"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        disabled={view === 'verify' || view === 'reset'}
                                    />
                                    <label htmlFor="email" className="absolute left-4 top-2 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:font-body-md peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:font-label-sm peer-focus:text-label-sm peer-focus:text-primary pointer-events-none">Email Address</label>
                                </div>
                            )}

                            {(view === 'verify' || view === 'reset') && (
                                <div className="relative">
                                    <input
                                        id="otp"
                                        type="text"
                                        required
                                        placeholder="OTP"
                                        className="peer w-full bg-[#1E1E1E] text-on-surface font-body-md text-body-md px-4 pt-6 pb-2 rounded border border-outline-variant placeholder-transparent input-glow focus:outline-none transition-all"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                                    />
                                    <label htmlFor="otp" className="absolute left-4 top-2 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:font-body-md peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:font-label-sm peer-focus:text-label-sm peer-focus:text-primary pointer-events-none">6-Digit OTP</label>
                                </div>
                            )}

                            {(view === 'login' || view === 'register' || view === 'reset') && (
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
                                    <label htmlFor="password" className="absolute left-4 top-2 font-label-sm text-label-sm text-on-surface-variant transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:font-body-md peer-placeholder-shown:text-body-md peer-focus:top-2 peer-focus:font-label-sm peer-focus:text-label-sm peer-focus:text-primary pointer-events-none">{view === 'reset' ? 'New Password' : 'Password'}</label>
                                </div>
                            )}
                        </div>

                        {loginError && <p className="text-error font-body-sm text-body-sm mt-2">{loginError.message}</p>}
                        {regError && <p className="text-error font-body-sm text-body-sm mt-2">{regError.message}</p>}
                        {verifyError && <p className="text-error font-body-sm text-body-sm mt-2">{verifyError.message}</p>}
                        {forgotError && <p className="text-error font-body-sm text-body-sm mt-2">{forgotError.message}</p>}
                        {resetError && <p className="text-error font-body-sm text-body-sm mt-2">{resetError.message}</p>}

                        {view === 'login' && (
                            <div className="flex justify-end pt-unit-xs">
                                <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); setView('forgot'); }}>Forgot Password?</a>
                            </div>
                        )}
                        {(view === 'verify' || view === 'forgot' || view === 'reset') && (
                            <div className="flex justify-end pt-unit-xs">
                                <a className="font-label-sm text-label-sm text-primary hover:text-primary-fixed transition-colors cursor-pointer" onClick={(e) => { e.preventDefault(); setView('login'); }}>Back to Login</a>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loginLoading || regLoading || verifyLoading || forgotLoading || resetLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-container text-background font-label-md text-label-md py-3 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity mt-unit-md shadow-sm disabled:opacity-50"
                        >
                            {view === 'login' ? 'Log In' : 
                             view === 'register' ? 'Sign Up' : 
                             view === 'verify' ? 'Verify OTP' : 
                             view === 'forgot' ? 'Send OTP' : 
                             'Reset Password'}
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    </form>


                </div>
            </div>
        </div>
    );
};

export default Auth;