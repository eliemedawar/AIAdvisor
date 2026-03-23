import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function SignInPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials. Use demo@university.edu with any password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#080B14' }}>

      {/* ── Left hero panel (desktop only) ────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-center p-16 overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(108,99,255,0.12)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-3xl" style={{ background: 'rgba(0,210,200,0.08)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative z-10 max-w-md"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)', boxShadow: '0 0 20px rgba(108,99,255,0.35)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>AI Advisor</span>
          </div>

          <h1 className="font-bold leading-tight text-white mb-5" style={{ fontFamily: 'Syne, sans-serif', fontSize: '3rem' }}>
            Your academic
            <span className="block" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              co-pilot.
            </span>
          </h1>

          <p className="text-base leading-relaxed mb-12" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Intelligent guidance for deadlines, study plans, and course decisions — all in one place.
          </p>

          <div className="flex flex-col gap-4">
            {['AI-powered chat advisor', 'Smart deadline tracking', 'Personalised study plans'].map((f, i) => (
              <motion.div key={f} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.35)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#6C63FF' }} />
                </div>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{f}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right form panel ───────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>AI Advisor</span>
          </div>

          <div className="mb-10">
            <h2 className="font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem' }}>Welcome back</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign in to continue your academic journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8 mb-8">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                    className="w-full bg-transparent pl-7 pb-2 text-sm text-white outline-none placeholder:text-white/25 transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
                    onFocus={e => (e.target.style.borderBottomColor = '#6C63FF')}
                    onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-transparent pl-7 pb-2 text-sm text-white outline-none placeholder:text-white/25 transition-colors"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.15)' }}
                    onFocus={e => (e.target.style.borderBottomColor = '#6C63FF')}
                    onBlur={e => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)')}
                  />
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs mb-6 p-3 rounded-xl" style={{ color: '#fb7185', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                {error}
              </motion.p>
            )}

            {/* Demo hint */}
            <div className="mb-6 p-3 rounded-xl text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
              <span style={{ color: '#00D2C8', fontWeight: 600 }}>Demo: </span>demo@university.edu / any password
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? undefined : '0 0 30px rgba(108,99,255,0.5)' }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#6C63FF,#5b52e0)', boxShadow: '0 0 20px rgba(108,99,255,0.3)', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            No account?{' '}
            <Link to="/auth/sign-up" className="font-medium transition-colors" style={{ color: '#6C63FF' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = '#818cf8')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = '#6C63FF')}>
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Named export alias
export const SignInPage$ = SignInPage;
