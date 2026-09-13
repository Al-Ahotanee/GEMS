/* Quiet Atlas: cartographic command canvas with cobalt geographic index and field-record content planes. */
import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import OfflineSyncManager from '../common/OfflineSyncManager';
import OfflineIncidentModal from '../common/OfflineIncidentModal';
import { AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

function DashboardLayout() {
  const location = useLocation();
  const { isAuthenticated, accessToken } = useSelector((s: RootState) => s.auth);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="atlas-shell min-h-screen bg-dark-bg atlas-grid">
      <OfflineSyncManager />
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="atlas-main lg:pl-72 print:pl-0 flex flex-col min-h-screen">
        {/* Top bar */}
        <TopBar />

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating SOS Incident Button */}
      <button
        onClick={() => setIsIncidentModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-status-error hover:bg-red-700 text-white py-3 px-4 rounded-full border-4 border-dark-bg shadow-lg shadow-red-900/25 flex items-center justify-center gap-2 transition-transform duration-200 hover:-translate-y-1 active:scale-95 group no-print"
        aria-label="Report Incident"
      >
        <AlertTriangle className="w-5 h-5 animate-pulse group-hover:animate-none" /><span className="hidden sm:inline text-xs font-extrabold uppercase tracking-[.12em]">Incident</span>
      </button>

      <OfflineIncidentModal 
        isOpen={isIncidentModalOpen} 
        onClose={() => setIsIncidentModalOpen(false)} 
      />
    </div>
  );
}

export default DashboardLayout;
