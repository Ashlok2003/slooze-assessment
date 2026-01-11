'use client';

import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="flex items-center justify-center min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>

        <div className="relative z-20 space-y-8 p-4">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-lg mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-blue-100/80 text-sm">Enter your credentials to access the portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-indigo-300 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/10 transition-all duration-200 sm:text-sm"
                    placeholder="admin@slooze.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-blue-100 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-indigo-300 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl leading-5 bg-white/5 text-white placeholder-indigo-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 focus:bg-white/10 transition-all duration-200 sm:text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-1 h-1 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]"></div>
                  <p className="text-sm text-red-200 font-medium">{error.message}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin text-white/80" />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-white/10">
            <p className="text-center text-xs font-semibold text-indigo-200/60 uppercase tracking-widest mb-4">
              Demo Access
            </p>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: 'Admin', email: 'admin@test.com' },
                { label: 'Manager', email: 'manager.in@test.com' },
              ].map((cred) => (
                <div
                  key={cred.label}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  onClick={() => {
                    setEmail(cred.email);
                    setPassword('password');
                  }}
                >
                  <span className="text-xs font-medium text-indigo-200">{cred.label}</span>
                  <div className="flex items-center gap-2">
                    <code className="text-[10px] px-2 py-0.5 rounded bg-black/20 text-indigo-300 font-mono">
                      {cred.email}
                    </code>
                    <ArrowRight className="w-3 h-3 text-white/0 group-hover:text-white/50 transition-all" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-xs text-indigo-300/40">
              Password for all accounts: <span className="font-mono text-indigo-200">password</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
