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
      window.location.href = '/catalog';
    }
  });

  const [register, { loading: regLoading, error: regError }] = useMutation(REGISTER_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.register.token);
      window.location.href = '/catalog';
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input 
              type="text" required 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand-500 focus:ring-brand-500" 
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand-500 focus:ring-brand-500" 
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input 
            type="password" required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand-500 focus:ring-brand-500" 
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
        </div>
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-brand-500 focus:ring-brand-500"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Student">Student</option>
              <option value="Instructor">Instructor</option>
            </select>
          </div>
        )}
        
        {loginError && <p className="text-red-500 text-sm">{loginError.message}</p>}
        {regError && <p className="text-red-500 text-sm">{regError.message}</p>}

        <button 
          type="submit" 
          disabled={loginLoading || regLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
        >
          {isLogin ? 'Sign In' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-brand-600 hover:text-brand-500">
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
