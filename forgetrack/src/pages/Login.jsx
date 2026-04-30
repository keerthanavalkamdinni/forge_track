import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AlertTriangle } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState('mentor'); // 'mentor' or 'student'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = mode === 'student' ? `${identifier}@forge.local` : identifier;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // The RoleGuard will handle routing to the right place
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-main flex items-center justify-center p-6">
      <div className="card w-full max-w-[440px] p-10 relative overflow-hidden">
        
        {/* Decorative inner glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent-glow rounded-full opacity-10 blur-3xl" />

        <div className="mb-10 text-center">
          <h1 className="text-display-sm text-primary mb-2">ForgeTrack</h1>
          <p className="text-body text-secondary">Sign in to your account</p>
        </div>

        {/* Tab Toggle */}
        <div className="flex p-1 bg-surface-inset rounded-[12px] border border-subtle mb-8">
          <button
            onClick={() => { setMode('mentor'); setIdentifier(''); setError(null); }}
            className={`flex-1 py-2 px-4 rounded-[8px] text-body font-medium transition-all ${
              mode === 'mentor' 
                ? 'bg-surface-raised text-primary shadow-sm' 
                : 'text-tertiary hover:text-secondary'
            }`}
            type="button"
          >
            Mentor Login
          </button>
          <button
            onClick={() => { setMode('student'); setIdentifier(''); setError(null); }}
            className={`flex-1 py-2 px-4 rounded-[8px] text-body font-medium transition-all ${
              mode === 'student' 
                ? 'bg-surface-raised text-primary shadow-sm' 
                : 'text-tertiary hover:text-secondary'
            }`}
            type="button"
          >
            Student Login
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-label text-secondary block mb-2">
              {mode === 'mentor' ? 'EMAIL ADDRESS' : 'USN'}
            </label>
            <input
              type={mode === 'mentor' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={mode === 'mentor' ? 'mentor@theboringpeople.in' : '4SH24CS001'}
              className="input"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-label text-secondary block">PASSWORD</label>
              {mode === 'mentor' && (
                <a href="#" className="text-caption text-tertiary hover:text-primary transition-colors">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input"
              required
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-danger-bg border border-danger-border text-danger-fg text-body-sm">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary w-full mt-2"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
