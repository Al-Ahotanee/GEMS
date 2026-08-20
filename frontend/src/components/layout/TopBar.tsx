import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  Bell,
  Search,
  UserCircle,
  LogOut,
  Settings,
  Wifi,
  WifiOff,
  ChevronDown,
  CloudOff,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useLiveQuery } from 'dexie-react-hooks';
import { RootState } from '../../store';
import { toggleSidebar } from '../../store/uiSlice';
import { logout } from '../../store/authSlice';
import { offlineDb } from '../../lib/offlineDb';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../services/api';

const routeTitleMap: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/notifications': 'Notifications',
  '/app/results/submit': 'Submit Result',
  '/app/results': 'Results',
  '/app/collation': 'Collation',
  '/app/disputes': 'Disputes',
  '/situation-room': 'Situation Room',
  '/app/admin/users': 'User Management',
  '/app/admin/applications': 'Applications',
  '/app/admin/polling-units': 'Polling Units',
  '/app/admin/elections': 'Elections',
  '/app/admin/audit': 'Audit Log',
  '/app/admin/reports': 'Reports',
  '/app/profile': 'Profile',
};

function getPageTitle(pathname: string): string {
  if (routeTitleMap[pathname]) return routeTitleMap[pathname];

  // Try prefix matching for nested routes
  const keys = Object.keys(routeTitleMap).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (pathname.startsWith(key)) return routeTitleMap[key];
  }

  return 'GSEM';
}

function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s: RootState) => s.auth);
  const isOnline = useSelector((s: RootState) => s.ui.isOnline);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pendingSyncCount = useLiveQuery(() => offlineDb.offlineResults.where('synced').equals(0).count()) || 0;
  const { data: unreadResponse } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled: Boolean(user?.id && isOnline),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const unreadCount = Number(unreadResponse?.data?.data?.count || 0);

  const pageTitle = getPageTitle(location.pathname);

  const fullName = user ? `${user.first_name} ${user.last_name}` : 'User';
  const initials = fullName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    dispatch(logout());
  };

  return (
    <header className="sticky top-0 z-30 bg-dark-surface/80 backdrop-blur-md border-b border-dark-border no-print">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-surface-2 transition-colors lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Page title */}
          <h2 className="font-display text-lg font-semibold text-text-primary hidden sm:block">
            {pageTitle}
          </h2>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search (placeholder for future use) */}
          <div className="hidden md:block relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search..."
                className="w-48 lg:w-64 bg-dark-surface-2 border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
              />
            </div>
          </div>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-surface-2 transition-colors md:hidden"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Online / Offline pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isOnline
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
            }`}
          >
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>

          {/* Pending Sync Badge */}
          {pendingSyncCount > 0 && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-accent-500/10 text-accent-500 border border-accent-500/20">
              <CloudOff className="w-3 h-3 animate-pulse" />
              {pendingSyncCount} Pending
            </div>
          )}

          {/* Notifications */}
          <button
            onClick={() => navigate('/app/notifications')}
            className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-dark-surface-2 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-surface-2 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-100 text-xs font-semibold">
                {initials}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-muted transition-transform duration-200 hidden sm:block ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-dark-surface-2 border border-dark-border rounded-xl shadow-xl overflow-hidden"
                >
                  {/* User info header */}
                  <div className="px-4 py-3 border-b border-dark-border">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {fullName}
                    </p>
                    <p className="text-xs text-text-muted truncate">{user?.email ?? ''}</p>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/app/profile');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-surface-3 transition-colors"
                    >
                      <UserCircle className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/app/profile');
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-dark-surface-3 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Account settings
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-dark-border py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile search bar (expandable) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-dark-border"
          >
            <div className="p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  placeholder="Search..."
                  autoFocus
                  className="w-full bg-dark-surface-2 border border-dark-border rounded-lg pl-9 pr-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default TopBar;
