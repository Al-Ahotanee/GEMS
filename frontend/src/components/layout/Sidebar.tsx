import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Bell,
  FileUp,
  BarChart3,
  Layers,
  AlertTriangle,
  Users,
  ClipboardList,
  MapPin,
  Vote,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Eye,
  Radio,
  UserCircle,
  LogOut,
  ChevronLeft,
  Wifi,
  WifiOff,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  roles: string[];
  section?: string;
}

const navItems: NavItem[] = [
  // Core — all authenticated users
  { label: 'Dashboard', to: '/app/dashboard', icon: LayoutDashboard, roles: ['*'] },
  { label: 'Notifications', to: '/app/notifications', icon: Bell, roles: ['*'] },

  // PU Agent
  { label: 'Submit Result', to: '/app/results/submit', icon: FileUp, roles: ['pu_agent'] },

  // Results & Collation
  { label: 'Results', to: '/app/results', icon: BarChart3, roles: ['pu_agent', 'ward_officer', 'lga_coordinator', 'state_coordinator', 'observer'] },
  { label: 'Collation', to: '/app/collation', icon: Layers, roles: ['ward_officer', 'lga_coordinator', 'state_coordinator'] },

  // Disputes
  { label: 'Disputes', to: '/app/disputes', icon: AlertTriangle, roles: ['ward_officer', 'lga_coordinator', 'state_coordinator'] },

  // Observer
  { label: 'Situation Room', to: '/situation-room', icon: Radio, roles: ['observer'] },

  // Admin section
  { label: 'Users', to: '/app/admin/users', icon: Users, roles: ['super_admin'], section: 'Admin' },
  { label: 'Applications', to: '/app/admin/applications', icon: ClipboardList, roles: ['super_admin'], section: 'Admin' },
  { label: 'Polling Units', to: '/app/admin/polling-units', icon: MapPin, roles: ['super_admin'], section: 'Admin' },
  { label: 'Elections', to: '/app/admin/elections', icon: Vote, roles: ['super_admin'], section: 'Admin' },
  { label: 'Audit Log', to: '/app/admin/audit', icon: ShieldCheck, roles: ['super_admin'], section: 'Admin' },
  { label: 'Anti-Rigging', to: '/app/admin/anti-rigging', icon: ShieldAlert, roles: ['super_admin', 'state_coordinator'], section: 'Admin' },
  { label: 'Reports', to: '/app/admin/reports', icon: FileText, roles: ['super_admin', 'state_coordinator', 'lga_coordinator'], section: 'Admin' },

  // Account — all authenticated users
  { label: 'Profile', to: '/app/profile', icon: UserCircle, roles: ['*'] },
];

const roleLabelMap: Record<string, string> = {
  pu_agent: 'PU Agent',
  ward_officer: 'Ward Officer',
  lga_coordinator: 'LGA Coordinator',
  state_coordinator: 'State Coordinator',
  super_admin: 'Super Admin',
  observer: 'Observer',
};

const sidebarVariants = {
  open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  closed: { x: '-100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

const linkVariants = {
  initial: { opacity: 0, x: -12 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.03, duration: 0.25 },
  }),
};

function Sidebar() {
  const dispatch = useDispatch();
  const { sidebarOpen } = useSelector((s: RootState) => s.ui);
  const { user } = useSelector((s: RootState) => s.auth);
  const isOnline = useSelector((s: RootState) => s.ui.isOnline);

  const userRole = user?.role ?? 'pu_agent';

  const filteredItems = navItems.filter((item) => {
    if (!item.roles.includes('*') && !item.roles.includes(userRole)) return false;
    
    // Hide Collation if missing required scope IDs
    if (item.label === 'Collation') {
      if (userRole === 'ward_officer' && !user?.ward_id) return false;
      if (userRole === 'lga_coordinator' && !user?.lga_id) return false;
    }
    
    return true;
  });

  const handleLogout = () => {
    dispatch(logout());
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      dispatch(toggleSidebar());
    }
  };

  // Group items by section
  let lastSection: string | undefined;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 bg-dark-surface border-r border-dark-border z-40 no-print">
        <SidebarContent
          filteredItems={filteredItems}
          userRole={userRole}
          userName={user ? `${user.first_name} ${user.last_name}` : 'User'}
          user={user}
          isOnline={isOnline}
          onLogout={handleLogout}
          onLinkClick={() => {}}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatch(toggleSidebar())}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-72 bg-dark-surface border-r border-dark-border z-50 lg:hidden flex flex-col"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex items-center justify-end p-3">
                <button
                  onClick={() => dispatch(toggleSidebar())}
                  className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-surface-2 transition-colors"
                  aria-label="Close sidebar"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent
                filteredItems={filteredItems}
                userRole={userRole}
                userName={user ? `${user.first_name} ${user.last_name}` : 'User'}
                user={user}
                isOnline={isOnline}
                onLogout={handleLogout}
                onLinkClick={closeSidebarOnMobile}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface SidebarContentProps {
  filteredItems: NavItem[];
  userRole: string;
  userName: string;
  user: any;
  isOnline: boolean;
  onLogout: () => void;
  onLinkClick: () => void;
}

function SidebarContent({ filteredItems, userRole, userName, user, isOnline, onLogout, onLinkClick }: SidebarContentProps) {
  let lastSection: string | undefined;
  let itemIndex = 0;

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Branding */}
      <div className="px-5 pt-6 pb-4 border-b border-dark-border">
        <NavLink to="/app/dashboard" className="block" onClick={onLinkClick}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-primary-500">
            G<span className="text-accent-500">S</span>EM
          </h1>
          <p className="text-[11px] text-text-muted mt-0.5 tracking-wide uppercase">
            Gombe State Election Monitor
          </p>
        </NavLink>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-dark-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-100 text-sm font-semibold">
            {userName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{userName}</p>
            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent-500/15 text-accent-500 uppercase tracking-wide">
              {roleLabelMap[userRole] ?? userRole}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {filteredItems.map((item) => {
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          const idx = itemIndex++;

          let targetPath = item.to;
          if (item.label === 'Collation') {
            if (userRole === 'ward_officer' && user?.ward_id) targetPath = `/app/collation/ward/${user.ward_id}`;
            else if (userRole === 'lga_coordinator' && user?.lga_id) targetPath = `/app/collation/lga/${user.lga_id}`;
            else if (userRole === 'state_coordinator') targetPath = `/app/collation/state`;
          }

          return (
            <div key={item.label}>
              {showSection && (
                <p className="px-4 pt-5 pb-2 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                  {item.section}
                </p>
              )}
              <motion.div
                variants={linkVariants}
                initial="initial"
                animate="animate"
                custom={idx}
              >
                <NavLink
                  to={targetPath}
                  onClick={onLinkClick}
                  className={({ isActive }) =>
                    isActive ? 'sidebar-link-active' : 'sidebar-link'
                  }
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </NavLink>
              </motion.div>
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-dark-border space-y-2">
        {/* Online / Offline indicator */}
        <div className="flex items-center gap-2 px-4 py-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-status-success" />
          ) : (
            <WifiOff className="w-4 h-4 text-status-error" />
          )}
          <span className={`text-xs font-medium ${isOnline ? 'text-status-success' : 'text-status-error'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
