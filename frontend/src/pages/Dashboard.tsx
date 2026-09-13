/* Quiet Atlas: the default dashboard is an election field desk—cobalt briefing, jurisdiction cues, and ordered action records. */
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Vote, AlertTriangle, Users, FileText, Upload, Eye, Shield, MapPin, ArrowUpRight, Compass, Radio } from 'lucide-react';
import type { ElementType } from 'react';
import { RootState } from '../store';
import { dashboardApi, adminApi } from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

type QuickLink = { label: string; path: string; icon: ElementType; color: 'primary' | 'accent' };

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  if (!user) return null;

  const isAdmin = ['super_admin', 'state_coordinator'].includes(user.role);
  const { data: stateData, isLoading } = useQuery({
    queryKey: ['state-dashboard'],
    queryFn: () => dashboardApi.getStateDashboard(),
    enabled: isAdmin,
  });

  const { data: adminStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    enabled: user.role === 'super_admin',
  });

  const dash = stateData?.data?.data;
  const stats = adminStats?.data?.data;

  if (isLoading && isAdmin) return <LoadingSpinner fullPage size="lg" />;

  const quickLinks: Record<string, QuickLink[]> = {
    super_admin: [
      { label: 'State Dashboard', path: '/app/dashboard/state', icon: BarChart3, color: 'primary' },
      { label: 'Manage Users', path: '/app/admin/users', icon: Users, color: 'accent' },
      { label: 'View Results', path: '/app/results', icon: FileText, color: 'primary' },
      { label: 'Situation Room', path: '/situation-room', icon: Eye, color: 'accent' },
    ],
    state_coordinator: [
      { label: 'State Dashboard', path: '/app/dashboard/state', icon: BarChart3, color: 'primary' },
      { label: 'View Results', path: '/app/results', icon: FileText, color: 'accent' },
      { label: 'State Collation', path: '/app/collation/state', icon: Shield, color: 'primary' },
      { label: 'Disputes', path: '/app/disputes', icon: AlertTriangle, color: 'accent' },
    ],
    lga_coordinator: [
      { label: 'My LGA Dashboard', path: `/app/dashboard/lga/${user.lga_id}`, icon: BarChart3, color: 'primary' },
      { label: 'Results', path: '/app/results', icon: FileText, color: 'accent' },
      { label: 'LGA Collation', path: `/app/collation/lga/${user.lga_id}`, icon: Shield, color: 'primary' },
      { label: 'Disputes', path: '/app/disputes', icon: AlertTriangle, color: 'accent' },
    ],
    ward_officer: [
      { label: 'My Ward', path: `/app/dashboard/ward/${user.ward_id}`, icon: MapPin, color: 'primary' },
      { label: 'Results', path: '/app/results', icon: FileText, color: 'accent' },
      { label: 'Ward Collation', path: `/app/collation/ward/${user.ward_id}`, icon: Shield, color: 'primary' },
      { label: 'Disputes', path: '/app/disputes', icon: AlertTriangle, color: 'accent' },
    ],
    pu_agent: [
      { label: 'Submit Result', path: '/app/results/submit', icon: Upload, color: 'accent' },
      { label: 'My Submissions', path: '/app/results', icon: FileText, color: 'primary' },
      { label: 'Situation Room', path: '/situation-room', icon: Eye, color: 'accent' },
    ],
    observer: [
      { label: 'Situation Room', path: '/situation-room', icon: Eye, color: 'accent' },
      { label: 'View Results', path: '/app/results', icon: FileText, color: 'primary' },
    ],
  };

  const roleName = user.role.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-7">
      <section className="atlas-brief p-6 sm:p-8 lg:p-9">
        <div className="relative z-10 grid gap-7 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[.62rem] font-extrabold uppercase tracking-[.16em] text-white/85">
              <Radio className="h-3.5 w-3.5 text-[#f1dfa7]" /> Live operations desk
            </div>
            <p className="mt-6 text-[.67rem] font-extrabold uppercase tracking-[.2em] text-[#f1dfa7]">Gombe State / Election Monitor</p>
            <h1 className="mt-2 max-w-3xl font-display text-4xl font-semibold leading-[.98] tracking-tight text-white sm:text-5xl">Good to see you, {user.first_name}.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">Your field desk brings the next operational decision into focus—evidence, territory, and review status in one accountable view.</p>
          </div>
          <div className="border-l border-white/20 pl-5 lg:pb-1">
            <p className="text-[.62rem] font-extrabold uppercase tracking-[.16em] text-white/55">Current assignment</p>
            <p className="mt-2 font-display text-2xl font-semibold text-white">{roleName}</p>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-[#cfe7de]"><Compass className="h-4 w-4" /> Jurisdiction-aware workspace</div>
          </div>
        </div>
      </section>

      {isAdmin && dash && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Territory signal</p><h2 className="mt-1 font-display text-2xl font-semibold text-text-primary">State reporting pulse</h2></div><p className="hidden text-xs text-text-muted sm:block">Verified operational signals across the current geography.</p></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard title="Total PUs" value={dash.total_polling_units} icon={MapPin} color="primary" />
            <StatCard title="Reported" value={dash.reported_polling_units} icon={FileText} color="accent" />
            <StatCard title="Total Votes" value={dash.total_votes_cast} icon={Vote} color="success" />
            <StatCard title="Turnout" value={parseFloat(dash.turnout_percentage)} icon={BarChart3} color="warning" subtitle="%" />
          </div>
        </section>
      )}

      {user.role === 'super_admin' && stats && (
        <section>
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Stewardship register</p><h2 className="mt-1 font-display text-2xl font-semibold text-text-primary">System attention points</h2></div></div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard title="Total Users" value={stats.users_by_role?.reduce((sum: number, role: { count: number }) => sum + role.count, 0) || 0} icon={Users} color="primary" />
            <StatCard title="Submissions" value={stats.total_submissions} icon={FileText} color="accent" />
            <StatCard title="Pending Reviews" value={stats.pending_reviews} icon={AlertTriangle} color="warning" />
            <StatCard title="Active Disputes" value={stats.active_disputes} icon={AlertTriangle} color="danger" />
          </div>
        </section>
      )}

      {user.role === 'pu_agent' && (
        <section className="surface-elevated border-primary-200 p-6 sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent-50 text-accent-700"><Upload className="h-7 w-7" /></span><div className="flex-1"><p className="eyebrow">Polling unit workflow</p><h2 className="mt-2 font-display text-2xl font-semibold text-text-primary">Evidence is ready when you are.</h2><p className="mt-2 text-sm text-text-muted">Upload the EC8A result sheet and enter vote counts to begin accountable review.</p></div><Link to="/app/results/submit" className="btn-accent whitespace-nowrap"><Upload className="h-5 w-5" /> Submit result</Link></div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow">Route index</p><h2 className="mt-1 font-display text-2xl font-semibold text-text-primary">Next operational move</h2></div><p className="hidden text-xs text-text-muted sm:block">Select a field record to continue.</p></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(quickLinks[user.role] || []).map((link, index) => (
            <Link key={link.path} to={link.path} data-index={`0${index + 1}`} className="atlas-action-card group p-5">
              <link.icon className={`mb-6 h-7 w-7 ${link.color === 'accent' ? 'text-accent-700' : 'text-primary-600'} transition-transform group-hover:scale-110`} />
              <p className="text-sm font-bold text-text-primary">{link.label}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-text-muted transition-colors group-hover:text-primary-700">Open workspace <ArrowUpRight className="h-3.5 w-3.5" /></span>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
