import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import { Truck, LogIn, UserPlus, Shield } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!email || !password) {
        throw new Error('Please fill in all fields.');
      }

      if (isAdminLogin) {
        // Hardcoded Admin Login
        if (email === 'admin' && password === 'admin123') {
          onLoginSuccess({ role: 'ADMIN' });
          return;
        } else {
          throw new Error('Invalid Admin Credentials.');
        }
      }

      let data, error;
      if (isSignUp) {
        const res = await supabase.auth.signUp({ email, password });
        error = res.error;
        data = res.data;
        if (!error && data?.user) {
          alert('Check your email for the login link! Or you might be logged in automatically.');
        }
      } else {
        const res = await supabase.auth.signInWithPassword({ email, password });
        error = res.error;
        data = res.data;
      }

      if (error) throw error;
      if (data?.session) {
        onLoginSuccess(data.session);
      }
    } catch (error) {
      setErrorMsg(error.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-kerala-cream flex flex-col items-center justify-center p-4 selection:bg-kerala-gold selection:text-white relative">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#D4AF37 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.1)] p-8 relative z-10 border border-gray-100">
        
        <div className="flex flex-col items-center mb-8">
          <div className={`p-4 rounded-full mb-4 shadow-lg ${isAdminLogin ? 'bg-red-900 text-white' : 'bg-kerala-teak text-kerala-gold'}`}>
            {isAdminLogin ? <Shield size={40} /> : <Truck size={40} />}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{isAdminLogin ? 'Admin Portal' : 'വണ്ടിമിത്ര'}</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">{isAdminLogin ? 'System Administration' : 'Logistics Assistant'}</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-bold border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">{isAdminLogin ? 'Admin ID' : 'Email (ഇമെയിൽ)'}</label>
            <input 
              type={isAdminLogin ? 'text' : 'email'} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdminLogin ? "admin" : "driver@example.com"} 
              className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-kerala-gold outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase">Password (പാസ്‌വേഡ്)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full mt-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-kerala-gold outline-none"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white font-bold py-4 rounded-xl mt-2 flex items-center justify-center gap-2 transition-colors disabled:opacity-70 shadow-md ${isAdminLogin ? 'bg-red-900 hover:bg-red-800' : 'bg-kerala-teak hover:bg-[#2A1A17]'}`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : isSignUp && !isAdminLogin ? (
              <><UserPlus size={20} /> Sign Up</>
            ) : (
              <><LogIn size={20} /> {isAdminLogin ? 'Secure Login' : 'Login'}</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-6 space-y-3">
          {!isAdminLogin && (
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </p>
              <button 
                type="button" 
                onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
                className="mt-1 text-kerala-green font-bold text-sm hover:underline"
              >
                {isSignUp ? 'Login Here' : 'Create New Account'}
              </button>
            </div>
          )}
          
          <button 
            type="button" 
            onClick={() => { setIsAdminLogin(!isAdminLogin); setIsSignUp(false); setErrorMsg(''); setEmail(''); setPassword(''); }}
            className="text-xs font-bold text-gray-400 hover:text-gray-700 mt-4 block mx-auto"
          >
            {isAdminLogin ? '← Back to Driver Login' : 'System Admin Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
