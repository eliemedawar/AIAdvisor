import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Calendar, CheckCircle2, Clock, AlertCircle, BookOpen, ArrowRight } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuth } from '../../hooks/useAuth';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar } from 'recharts';
import { Badge } from '../../components/ui/Badge';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { overview, loading } = useDashboard();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.first_name || 'there';

  const gpaTrend = overview?.gpa_trend || [];
  const currentGpa = typeof overview?.current_gpa === 'number' ? overview.current_gpa : null;

  const gpaDirection = gpaTrend.length >= 2
    ? gpaTrend[gpaTrend.length - 1].gpa > gpaTrend[0].gpa ? 'up' : 'down'
    : 'neutral';

  const upcomingDeadlines = overview?.upcoming_deadlines?.slice(0, 5) || [];
  const weeklyStats = overview?.weekly_task_stats || [];
  const studyTime = overview?.study_time_by_course || [];

  const next3 = [
    ...(overview?.weekly_tasks || []),
    ...(overview?.upcoming_deadlines || []),
  ]
    .filter(t => t.due_at)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .slice(0, 3);

  const totalCompleted = weeklyStats.reduce((s, d) => s + d.completed, 0);
  const totalPlanned = weeklyStats.reduce((s, d) => s + d.planned, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-screen" style={{ background: '#080B14' }}>
      <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(108,99,255,0.3)', borderTopColor: '#6C63FF' }} />
    </div>
  );

  return (
    <motion.div variants={stagger} initial="initial" animate="animate" className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Hero */}
      <motion.div variants={fadeUp} className="relative rounded-3xl overflow-hidden mb-8 p-8 lg:p-10"
        style={{ background: 'linear-gradient(135deg, rgba(108,99,255,0.08) 0%, rgba(0,0,0,0) 60%, rgba(0,210,200,0.06) 100%)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl" style={{ background: 'rgba(108,99,255,0.07)' }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="font-bold text-3xl lg:text-4xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              {greeting},{' '}
              <span style={{ background: 'linear-gradient(135deg,#6C63FF,#00D2C8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {firstName}
              </span>
            </h1>
          </div>
          {currentGpa !== null && (
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {gpaDirection === 'up'
                ? <TrendingUp className="w-5 h-5" style={{ color: '#00D2C8' }} />
                : <TrendingDown className="w-5 h-5" style={{ color: '#fb7185' }} />}
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>Current GPA</p>
                <p className="font-bold text-2xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{currentGpa.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stat strip */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Upcoming', value: upcomingDeadlines.length, color: '#6C63FF' },
          { label: 'Tasks done', value: `${totalCompleted}/${totalPlanned}`, color: '#00D2C8' },
          { label: 'Courses', value: studyTime.length, color: '#f59e0b' },
          { label: 'At risk', value: studyTime.filter(c => c.hours < 5).length, color: studyTime.filter(c => c.hours < 5).length > 0 ? '#fb7185' : '#00D2C8' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.07)`, borderLeft: `4px solid ${color}` }}>
            <p className="font-bold text-2xl text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
            <p className="text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-semibold text-white text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>GPA Trend</h2>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Across all semesters</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={gpaTrend}>
              <defs>
                <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="term" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Area type="monotone" dataKey="gpa" stroke="#6C63FF" strokeWidth={2} fill="url(#gpaGrad)" dot={{ fill: '#6C63FF', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-semibold text-white text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Weekly Tasks</h2>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Completed vs planned</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyStats} barSize={6} barGap={2}>
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="planned" fill="rgba(108,99,255,0.2)" radius={[4,4,0,0]} />
              <Bar dataKey="completed" fill="#6C63FF" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom row */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next tasks */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>Next up</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Your immediate priorities</p>
            </div>
            <button onClick={() => navigate('/planner')} className="text-xs flex items-center gap-1 transition-colors" style={{ color: '#6C63FF' }}>
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {next3.length > 0 ? next3.map((task, i) => (
              <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl transition-colors"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(108,99,255,0.15)' }}>
                  <Clock className="w-4 h-4" style={{ color: '#6C63FF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{task.title}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Due {new Date(task.due_at!).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                {'priority' in task && (
                  <Badge variant={task.priority === 'high' ? 'rose' : task.priority === 'medium' ? 'amber' : 'default'}>
                    {task.priority}
                  </Badge>
                )}
              </motion.div>
            )) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-3" style={{ color: '#00D2C8' }} />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>All caught up!</p>
              </div>
            )}
          </div>
        </div>

        {/* Study time */}
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="font-semibold text-white text-lg mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>Study time</h2>
          <p className="text-xs mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Hours per course this week</p>
          <div className="space-y-4">
            {studyTime.map((c) => {
              const max = Math.max(...studyTime.map(x => x.hours), 1);
              const pct = (c.hours / max) * 100;
              const isRisk = c.hours < 5;
              return (
                <div key={c.courseName}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-white">{c.courseName}</span>
                    <span className="text-xs font-semibold" style={{ color: isRisk ? '#f59e0b' : '#00D2C8' }}>{c.hours}h</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="h-full rounded-full"
                      style={{ background: isRisk ? '#f59e0b' : 'linear-gradient(90deg, #6C63FF, #00D2C8)' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
