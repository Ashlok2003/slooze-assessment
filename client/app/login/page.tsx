'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';

const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      access_token
      user {
        id
        email
        role
        country
      }
    }
  }
`;

interface LoginData {
  login: {
    access_token: string;
    user: {
      id: string;
      email: string;
      role: string;
      country: string;
    };
  };
}

interface LoginVars {
  loginInput: {
    email: string;
    password: string;
  };
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { loading, error }] = useMutation<LoginData, LoginVars>(LOGIN_MUTATION);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: {
          loginInput: { email, password },
        },
      });
      if (data?.login?.access_token) {
        localStorage.setItem('token', data.login.access_token);
        localStorage.setItem('user', JSON.stringify(data.login.user));
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="name@company.com"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-semibold rounded-lg shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 text-center uppercase tracking-wider mb-4">Demo Credentials</p>
          <div className="grid gap-2 text-xs text-gray-600">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-medium">Admin</span>
              <code className="bg-white px-2 py-1 rounded border">admin@test.com</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-medium">Manager</span>
              <code className="bg-white px-2 py-1 rounded border">manager.in@test.com</code>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
              <span className="font-medium">Member</span>
              <code className="bg-white px-2 py-1 rounded border">member.in@test.com</code>
            </div>
            <div className="text-center mt-2 text-gray-400">Password: <span className="font-mono text-gray-600">password</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
