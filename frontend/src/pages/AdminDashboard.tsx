import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, FileText, AlertTriangle, ClipboardList, Settings, Shield, BarChart3, Scroll } from 'lucide-react';
import { adminApi } from '../services/api';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import PageHeader from '../components/common/PageHeader';

const COLORS = ['#1a5632', '#f5c842', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getDashboardStats() });
  const stats = data?.data?.data;

  if (isLoading) return <LoadingSpinner fullPage size="lg" />;
  if (!stats) return null;

  const userChart = stats.users_by_role?.map((r: { role: string; count: number }) => ({ name: r.role.replace(/_/g, ' '), value: r.count }));

  const links = [
    { label: 'Manage Users', path: '/admin/users', icon: Users, color: 'text-primary-400' },
    { label: 'Applications', path: '/admin/applications', icon: ClipboardList, color: 'text-accent-500' },
    { label: 'Elections', path: '/admin/elections', icon: BarChart3, color: 'text-blue-400' },
    { label: 'Polling Units', path: '/admin/polling-units', icon: Settings, color: 'text-green-400' },
    { label: 'Audit Log', path: '/admin/audit', icon: Scroll, color: 'text-orange-400' },
    { label: 'Reports', path: '/admin/reports', icon: FileText, color: 'text-purple-400' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="System administration overview" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats.users_by_role?.reduce((s: number, r: { count: number }) => s + r.count, 0) || 0} icon={Users} color="primary" />
        <StatCard title="Submissions" value={stats.total_submissions} icon={FileText} color="accent" />
        <StatCard title="Pending Reviews" value={stats.pending_reviews} icon={AlertTriangle} color="warning" />
        <StatCard title="Active Disputes" value={stats.active_disputes} icon={AlertTriangle} color="danger" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Users by Role</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart><Pie data={userChart} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {userChart?.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie><Tooltip /></PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Pending Applications</h3>
          <div className="text-center py-4">
            <p className="font-mono text-4xl font-bold text-accent-500">{stats.pending_applications}</p>
            <p className="text-text-muted mt-2">Awaiting review</p>
            <Link to="/admin/applications" className="btn-outline mt-4 inline-block text-sm">Review Applications</Link>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-display text-lg font-semibold text-text-primary mb-4">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {links.map((link, i) => (
            <Link key={i} to={link.path} className="glass-card p-4 hover:border-primary-500/30 transition-all group">
              <link.icon className={`w-8 h-8 mb-2 ${link.color} group-hover:scale-110 transition-transform`} />
              <p className="text-sm font-medium text-text-primary">{link.label}</p>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
