import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirm: '', first_name: '', last_name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const fieldStyle = {
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderBottomColor = '#6C63FF');
  const onBlur  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderBottomColor = 'rgba(255,255,255,0.15)');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await register({ email: form.email, password: form.password, first_name: form.first_name, last_name: form.last_name });
      navigate('/dashboard');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#080B14' }}>

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-start justify-center p-16 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full blur-3xl" style={{ background: 'rgba(108,99,255,0.12)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full blur-3xl" style={{ background: 'rgba(0,210,200,0.08)' }} />

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)', boxShadow: '0 0 20px rgba(108,99,255,0.35)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>AI Advisor</span>
          </div>
          <h1 className="font-bold leading-tight text-white mb-5" style={{ fontFamily: 'Syne, sans-serif', fontSize: '3rem' }}>
            Start your academic
            <span className="block" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>journey.</span>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Create an account to unlock personalised study insights and achieve your academic goals.
          </p>
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)' }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>AI Advisor</span>
          </div>

          <div className="mb-10">
            <h2 className="font-bold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.75rem' }}>Create account</h2>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Start your AI-powered academic journey</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-7 mb-8">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-5">
                {[['first_name','First name','John'],['last_name','Last name','Doe']].map(([k,lbl,ph]) => (
                  <div key={k}>
                    <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>{lbl}</label>
                    <div className="relative">
                      <User className="absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.25)' }} />
                      <input type="text" value={(form as any)[k]} onChange={set(k)} placeholder={ph}
                        className="w-full bg-transparent pl-6 pb-2 text-sm text-white outline-none placeholder:text-white/25"
                        style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input type="email" value={form.email} onChange={set('email')} placeholder="you@university.edu" required
                    className="w-full bg-transparent pl-7 pb-2 text-sm text-white outline-none placeholder:text-white/25"
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required
                    className="w-full bg-transparent pl-7 pb-2 text-sm text-white outline-none placeholder:text-white/25"
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>

              {/* Confirm */}
              <div>
                <label className="block text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
                  <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="••••••••" required
                    className="w-full bg-transparent pl-7 pb-2 text-sm text-white outline-none placeholder:text-white/25"
                    style={fieldStyle} onFocus={onFocus} onBlur={onBlur} />
                </div>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs mb-6 p-3 rounded-xl" style={{ color: '#fb7185', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                {error}
              </motion.p>
            )}

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02, boxShadow: loading ? undefined : '0 0 30px rgba(108,99,255,0.5)' }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg,#6C63FF,#5b52e0)', boxShadow: '0 0 20px rgba(108,99,255,0.3)', opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Already have an account?{' '}
            <Link to="/auth/sign-in" className="font-medium" style={{ color: '#6C63FF' }}>Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export const SignUpPage$ = SignUpPage;
