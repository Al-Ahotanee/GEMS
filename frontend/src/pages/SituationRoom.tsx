/* Quiet Atlas: a cloud-white public operations map with cobalt wayfinding and moss live-status signals. */
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector
} from 'recharts';
import {
  Shield, Vote, TrendingUp, MapPin, Users, Share2, Filter, Activity,
  CheckCircle, Clock, ArrowUpRight, BarChart2, PieChart as PieChartIcon,
  Download, Search, AlertCircle, FileText, ChevronRight
} from 'lucide-react';
import CountUp from 'react-countup';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { publicApi } from '../services/api';
import { CandidateResult, LGADashboardSummary, WardDashboardSummary } from '../types';

const COLORS = ['#31598A', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const getPartyColor = (partyCode: string, index: number) => {
  const map: Record<string, string> = {
    'APC': '#31598A',
    'PDP': '#ef4444',
    'NNPP': '#10b981',
    'LP': '#f97316',
    'PRP': '#8b5cf6',
  };
  return map[partyCode?.toUpperCase()] || COLORS[index % COLORS.length];
};

const MapController = ({ selectedLgaCoords }: { selectedLgaCoords: [number, number] | null }) => {
  const map = useMap();
  React.useEffect(() => {
    if (selectedLgaCoords) {
      map.flyTo(selectedLgaCoords, 11, { duration: 1.2 });
    } else {
      map.flyTo([10.2897, 11.1711], 9, { duration: 1.2 }); // Gombe Center
    }
  }, [selectedLgaCoords, map]);
  return null;
};

// Custom Active Shape for PieChart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 28) * cos;
  const my = cy + (outerRadius + 28) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#1c2c40" className="font-bold text-xl font-mono">
        {payload.party_code}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} textAnchor={textAnchor} fill="#1c2c40" className="font-mono text-xs font-bold">
        {value.toLocaleString()}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 10} y={ey} dy={16} textAnchor={textAnchor} fill="#607186" className="text-[11px] font-mono">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export default function SituationRoomPage() {
  const [selectedLgaId, setSelectedLgaId] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Main State query
  const { data: stateData, isLoading: isStateLoading } = useQuery({
    queryKey: ['situation-room'],
    queryFn: () => publicApi.getSituationRoom(),
    refetchInterval: 15000,
  });

  // Dedicated LGA query (active when an LGA is selected)
  const { data: lgaData, isLoading: isLgaLoading } = useQuery({
    queryKey: ['situation-room-lga', selectedLgaId],
    queryFn: () => publicApi.getSituationRoomLGA(selectedLgaId!),
    enabled: selectedLgaId !== null,
    refetchInterval: 15000,
  });

  const room = stateData?.data?.data;
  const lgaDetail = lgaData?.data?.data;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GSEM Situation Room',
        text: 'Live verified election intelligence and voting metrics for Gombe State.',
        url: window.location.href,
      }).catch(console.error);
    }
  };

  // Consolidated View Data (Statewide or LGA-Filtered)
  const currentViewData = useMemo(() => {
    if (!room) return null;

    if (!selectedLgaId) {
      return {
        title: 'Gombe State (All 11 LGAs)',
        isLga: false,
        total_registered_voters: room.total_registered_voters || 0,
        total_accredited_voters: room.total_accredited_voters || 0,
        total_votes_cast: room.total_votes_cast || 0,
        total_valid_votes: room.total_valid_votes || 0,
        rejected_votes: room.rejected_votes || 0,
        accreditation_percentage: room.accreditation_percentage || 0,
        turnout_percentage: room.turnout_percentage || 0,
        valid_vote_percentage: room.valid_vote_percentage || 0,
        rejected_vote_percentage: room.rejected_vote_percentage || 0,
        reported_polling_units: room.reported_polling_units || 0,
        verified_polling_units: room.verified_polling_units || 0,
        total_polling_units: room.total_polling_units || 0,
        reporting_percentage: room.reporting_percentage || 0,
        candidates: room.candidates || [],
        leading_party: room.leading_party || 'N/A',
        leading_candidate: room.leading_candidate || 'N/A',
        lead_margin: room.lead_margin || 0,
      };
    }

    // When an LGA is selected, prefer the detailed LGA endpoint data
    if (lgaDetail) {
      return {
        title: `${lgaDetail.lga.name} LGA`,
        isLga: true,
        total_registered_voters: lgaDetail.total_registered_voters || 0,
        total_accredited_voters: lgaDetail.total_accredited_voters || 0,
        total_votes_cast: lgaDetail.total_votes_cast || 0,
        total_valid_votes: lgaDetail.total_valid_votes || 0,
        rejected_votes: lgaDetail.rejected_votes || 0,
        accreditation_percentage: lgaDetail.accreditation_percentage || 0,
        turnout_percentage: lgaDetail.turnout_percentage || 0,
        valid_vote_percentage: lgaDetail.valid_vote_percentage || 0,
        rejected_vote_percentage: lgaDetail.rejected_vote_percentage || 0,
        reported_polling_units: lgaDetail.reported_polling_units || 0,
        verified_polling_units: lgaDetail.verified_polling_units || 0,
        total_polling_units: lgaDetail.total_polling_units || 0,
        reporting_percentage: lgaDetail.reporting_percentage || 0,
        candidates: lgaDetail.candidates || [],
        leading_party: lgaDetail.leading_party || 'N/A',
        leading_candidate: lgaDetail.leading_candidate || 'N/A',
        lead_margin: lgaDetail.lead_margin || 0,
        wards: lgaDetail.wards || [],
      };
    }

    // Fallback while LGA details load
    const fallbackLga = room.lga_breakdown?.find((l: LGADashboardSummary) => l.lga_id === selectedLgaId);
    if (!fallbackLga) return null;

    return {
      title: `${fallbackLga.lga_name} LGA`,
      isLga: true,
      total_registered_voters: fallbackLga.total_registered_voters || 0,
      total_accredited_voters: fallbackLga.total_accredited_voters || 0,
      total_votes_cast: fallbackLga.total_votes_cast || 0,
      total_valid_votes: fallbackLga.total_valid_votes || 0,
      rejected_votes: fallbackLga.rejected_votes || 0,
      accreditation_percentage: fallbackLga.accreditation_percentage || 0,
      turnout_percentage: fallbackLga.turnout_percentage || 0,
      valid_vote_percentage: fallbackLga.total_votes_cast && fallbackLga.total_valid_votes ? Number(((fallbackLga.total_valid_votes / fallbackLga.total_votes_cast) * 100).toFixed(2)) : 0,
      rejected_vote_percentage: fallbackLga.total_votes_cast && fallbackLga.rejected_votes ? Number(((fallbackLga.rejected_votes / fallbackLga.total_votes_cast) * 100).toFixed(2)) : 0,
      reported_polling_units: fallbackLga.reported_polling_units || 0,
      verified_polling_units: fallbackLga.verified_polling_units || 0,
      total_polling_units: fallbackLga.total_polling_units || 0,
      reporting_percentage: fallbackLga.reporting_percentage || 0,
      candidates: fallbackLga.candidates || [],
      leading_party: fallbackLga.leading_party || 'N/A',
      leading_candidate: fallbackLga.leading_candidate || 'N/A',
      lead_margin: fallbackLga.lead_margin || 0,
      wards: [],
    };
  }, [room, selectedLgaId, lgaDetail]);

  const activeLgaCoords = useMemo(() => {
    if (!selectedLgaId || !room?.lga_breakdown) return null;
    const lga = room.lga_breakdown.find((l: LGADashboardSummary) => l.lga_id === selectedLgaId);
    if (lga?.latitude && lga?.longitude) return [Number(lga.latitude), Number(lga.longitude)] as [number, number];
    const fallbackCoords: Record<string, [number, number]> = {
      'Akko': [10.2744, 11.0254], 'Balanga': [9.7909, 11.6669], 'Billiri': [9.8659, 11.2227],
      'Dukku': [10.8245, 10.7722], 'Funakaye': [10.8524, 11.4422], 'Gombe': [10.2897, 11.1711],
      'Kaltungo': [9.8142, 11.3069], 'Kwami': [10.4566, 11.2384], 'Nafada': [11.0945, 11.3323],
      'Shongom': [9.7118, 11.2227], 'Yamaltu/Deba': [10.2173, 11.4927]
    };
    return lga ? fallbackCoords[lga.lga_name] : null;
  }, [selectedLgaId, room]);

  const sortedLgas = useMemo(() => {
    if (!room?.lga_breakdown) return [];
    return [...room.lga_breakdown].sort((a, b) => b.reporting_percentage - a.reporting_percentage);
  }, [room]);

  const topCandidates = useMemo(() => {
    if (!currentViewData?.candidates) return [];
    return [...currentViewData.candidates].sort((a, b) => b.total_votes - a.total_votes);
  }, [currentViewData]);

  const leadingCandidate = topCandidates[0];
  const runnerUp = topCandidates[1];
  const leadMargin = leadingCandidate && runnerUp ? leadingCandidate.total_votes - runnerUp.total_votes : leadingCandidate?.total_votes || 0;
  const leadMarginPct = leadingCandidate && runnerUp ? Number((leadingCandidate.vote_percentage - runnerUp.vote_percentage).toFixed(2)) : leadingCandidate?.vote_percentage || 0;

  // Filtered Table Register Data
  const filteredRegisterRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (selectedLgaId && currentViewData?.wards) {
      return (currentViewData.wards as WardDashboardSummary[]).filter(w =>
        !query || w.ward_name.toLowerCase().includes(query) || (w.ward_code && w.ward_code.toLowerCase().includes(query))
      );
    }
    if (room?.lga_breakdown) {
      return (room.lga_breakdown as LGADashboardSummary[]).filter(l =>
        !query || l.lga_name.toLowerCase().includes(query) || (l.leading_party && l.leading_party.toLowerCase().includes(query))
      );
    }
    return [];
  }, [selectedLgaId, currentViewData, room, searchTerm]);

  // Export CSV Briefing
  const handleExportCSV = () => {
    if (!currentViewData) return;
    let headers = '';
    let rows: string[] = [];
    let filename = '';

    if (selectedLgaId && lgaDetail) {
      filename = `GSEM_${lgaDetail.lga.name.replace(/\s+/g, '_')}_Wards_${Date.now()}.csv`;
      headers = 'Ward Name,Ward Code,Total PUs,Reported PUs,Verified PUs,Registered Voters,Accredited Voters,Votes Cast,Valid Votes,Rejected Ballots,Turnout %,Reporting %,Leading Party\n';
      rows = (lgaDetail.wards || []).map((w: any) =>
        `"${w.ward_name}","${w.ward_code || ''}",${w.total_polling_units},${w.reported_polling_units},${w.verified_polling_units || 0},${w.total_registered_voters || 0},${w.total_accredited_voters || 0},${w.total_votes_cast || 0},${w.total_valid_votes || 0},${w.rejected_votes || 0},"${w.turnout_percentage}%","${w.reporting_percentage}%","${w.leading_party || 'N/A'}"`
      );
    } else {
      filename = `GSEM_Statewide_LGAs_${Date.now()}.csv`;
      headers = 'LGA Name,Total PUs,Reported PUs,Verified PUs,Registered Voters,Accredited Voters,Votes Cast,Valid Votes,Rejected Ballots,Turnout %,Reporting %,Leading Party\n';
      rows = (room?.lga_breakdown || []).map((l: any) =>
        `"${l.lga_name}",${l.total_polling_units},${l.reported_polling_units},${l.verified_polling_units || 0},${l.total_registered_voters || 0},${l.total_accredited_voters || 0},${l.total_votes_cast || 0},${l.total_valid_votes || 0},${l.rejected_votes || 0},"${l.turnout_percentage || 0}%","${l.reporting_percentage}%","${l.leading_party || 'N/A'}"`
      );
    }

    const blob = new Blob([headers + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isLoading = isStateLoading || (selectedLgaId !== null && isLgaLoading && !currentViewData);

  return (
    <div className="min-h-screen bg-[#f7f9fc] text-text-primary font-sans selection:bg-primary-100 atlas-grid">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-100/35 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl border-b border-dark-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary-700 rounded-xl flex items-center justify-center shadow-md shadow-primary-900/10">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-primary-900 tracking-tight">
                  GSEM SITUATION ROOM
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-primary-50 text-primary-700 border border-primary-200">
                  {room?.election?.title || 'General Election 2027'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted mt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent-50 text-accent-700 border border-accent-200 text-[11px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-600"></span>
                  </span>
                  OFFICIALLY VERIFIED FEED
                </span>
                <span>•</span>
                <Clock className="w-3 h-3" />
                <span>{room?.last_updated ? new Date(room.last_updated).toLocaleTimeString() : 'Connecting...'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-dark-border hover:border-primary-300 hover:bg-primary-50/50 transition-all text-xs font-bold text-text-secondary shadow-sm"
              title="Download verified data report as CSV"
            >
              <Download className="w-4 h-4 text-primary-700" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-dark-border hover:border-primary-300 hover:bg-primary-50/50 transition-all text-xs font-bold text-text-secondary shadow-sm"
            >
              <Share2 className="w-4 h-4 text-text-muted" />
              <span>Share</span>
            </button>
            <Link
              to="/login"
              className="btn-primary text-center px-4 py-2 text-xs font-bold shadow-sm"
            >
              Field Agent Portal
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-14 h-14 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-text-muted font-mono text-sm animate-pulse">Connecting to verified collation database...</p>
          </div>
        ) : !room || !currentViewData ? (
          <div className="text-center py-20 text-text-muted">No election data currently streaming</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedLgaId || 'state'}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Jurisdiction Command Bar */}
              <div className="bg-white border border-dark-border rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-2xl font-bold text-primary-900 tracking-tight">
                      {currentViewData.title}
                    </h2>
                    {selectedLgaId && (
                      <button
                        onClick={() => { setSelectedLgaId(null); setSearchTerm(''); }}
                        className="text-xs font-bold bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1 rounded-full transition-colors border border-primary-200 flex items-center gap-1"
                      >
                        Clear Filter ✕
                      </button>
                    )}
                  </div>
                  <p className="text-text-muted text-xs flex items-center gap-1.5 mt-1 font-mono">
                    <CheckCircle className="w-3.5 h-3.5 text-accent-600" />
                    {selectedLgaId
                      ? `Viewing ward-level collation data for ${currentViewData.title}`
                      : 'Aggregated statewide collation totals across all 11 Local Government Areas'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-2 bg-dark-surface-2 rounded-lg px-3 py-1.5 border border-dark-border">
                    <Filter className="w-4 h-4 text-primary-700" />
                    <select
                      className="bg-transparent text-text-primary text-xs font-bold outline-none cursor-pointer pr-4"
                      value={selectedLgaId || ''}
                      onChange={(e) => {
                        setSelectedLgaId(e.target.value ? Number(e.target.value) : null);
                        setSearchTerm('');
                      }}
                    >
                      <option value="">Gombe State (All 11 LGAs)</option>
                      {sortedLgas.map((l: LGADashboardSummary) => (
                        <option key={l.lga_id} value={l.lga_id}>
                          {l.lga_name} LGA
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 6-Metric Executive KPI Grid (State & LGA Parity) */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {/* 1. Registered Voters */}
                <div className="bg-white border border-dark-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Registered Voters</span>
                    <Users className="w-4 h-4 text-primary-700" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    <CountUp end={currentViewData.total_registered_voters} separator="," duration={1.5} />
                  </div>
                  <p className="text-[11px] text-text-muted mt-1 font-mono">Eligible Electorate</p>
                </div>

                {/* 2. Accredited Voters */}
                <div className="bg-white border border-dark-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Accredited</span>
                    <CheckCircle className="w-4 h-4 text-accent-600" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    <CountUp end={currentViewData.total_accredited_voters} separator="," duration={1.5} />
                  </div>
                  <p className="text-[11px] text-accent-700 font-mono font-bold mt-1">
                    {currentViewData.accreditation_percentage}% rate
                  </p>
                </div>

                {/* 3. Total Votes Cast */}
                <div className="bg-white border border-dark-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Cast</span>
                    <Vote className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    <CountUp end={currentViewData.total_votes_cast} separator="," duration={1.5} />
                  </div>
                  <p className="text-[11px] text-primary-700 font-mono font-bold mt-1">
                    {currentViewData.turnout_percentage}% turnout
                  </p>
                </div>

                {/* 4. Total Valid Votes */}
                <div className="bg-white border border-dark-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Valid Votes</span>
                    <TrendingUp className="w-4 h-4 text-accent-600" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    <CountUp end={currentViewData.total_valid_votes} separator="," duration={1.5} />
                  </div>
                  <p className="text-[11px] text-text-muted font-mono mt-1">
                    {currentViewData.valid_vote_percentage}% validity
                  </p>
                </div>

                {/* 5. Rejected Ballots */}
                <div className="bg-white border border-dark-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Rejected Ballots</span>
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-amber-600">
                    <CountUp end={currentViewData.rejected_votes} separator="," duration={1.5} />
                  </div>
                  <p className="text-[11px] text-text-muted font-mono mt-1">
                    {currentViewData.rejected_vote_percentage}% invalid
                  </p>
                </div>

                {/* 6. Polling Units Verified */}
                <div className="bg-white border border-dark-border rounded-xl p-4 relative overflow-hidden shadow-sm hover:border-primary-300 transition-all">
                  <div className="flex items-center justify-between text-text-muted mb-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">PUs Verified</span>
                    <Activity className="w-4 h-4 text-primary-700" />
                  </div>
                  <div className="font-mono text-2xl font-bold text-text-primary">
                    <CountUp end={currentViewData.verified_polling_units} separator="," duration={1.5} />
                    <span className="text-xs text-text-muted font-sans font-normal ml-1">/ {currentViewData.total_polling_units}</span>
                  </div>
                  <div className="w-full bg-primary-100/60 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${currentViewData.reporting_percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Leader & Margin Banner */}
              {leadingCandidate && (
                <div className="bg-gradient-to-r from-primary-50 via-white to-accent-50/40 border border-primary-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-base shadow-sm"
                      style={{ backgroundColor: getPartyColor(leadingCandidate.party_code, 0) }}
                    >
                      {leadingCandidate.party_code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-primary-700 uppercase tracking-widest bg-primary-100/60 px-2 py-0.5 rounded">
                          Leading Contender
                        </span>
                        <span className="text-xs text-text-muted font-mono">• {currentViewData.title}</span>
                      </div>
                      <h3 className="font-display text-xl font-bold text-primary-950 mt-0.5">
                        {leadingCandidate.full_name}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-mono mt-1 text-text-secondary">
                        <span><strong>{leadingCandidate.total_votes.toLocaleString()}</strong> votes ({leadingCandidate.vote_percentage}%)</span>
                        {runnerUp && (
                          <>
                            <span>|</span>
                            <span className="text-accent-800 font-bold flex items-center gap-1">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                              Lead Margin: +{leadMargin.toLocaleString()} votes (+{leadMarginPct}%)
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {runnerUp && (
                    <div className="bg-white/90 border border-dark-border rounded-lg p-3 text-xs font-mono min-w-[220px]">
                      <div className="text-[10px] uppercase text-text-muted font-extrabold mb-1">Second Place</div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-text-primary">{runnerUp.full_name} ({runnerUp.party_code})</span>
                        <span className="font-bold">{runnerUp.total_votes.toLocaleString()}</span>
                      </div>
                      <div className="text-[11px] text-text-muted mt-0.5">{runnerUp.vote_percentage}% of valid votes</div>
                    </div>
                  )}
                </div>
              )}

              {/* Main Analysis Section: Map, Charts & Standings */}
              <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Standings & Vote Distribution */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Standings List */}
                  <div className="bg-white border border-dark-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-display text-base font-bold text-primary-900 mb-4 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4 text-primary-700" />
                      Candidate Standings ({topCandidates.length})
                    </h3>
                    <div className="space-y-3">
                      {topCandidates.map((c: CandidateResult, i: number) => {
                        const color = getPartyColor(c.party_code, i);
                        return (
                          <div
                            key={c.candidate_id}
                            className="p-3 rounded-lg bg-dark-surface-2/60 border border-dark-border relative overflow-hidden group hover:border-primary-300 transition-all"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                            <div className="flex justify-between items-start mb-1.5 pl-2">
                              <div>
                                <span className="font-bold text-sm text-text-primary">{c.party_code}</span>
                                <p className="text-xs text-text-muted truncate max-w-[160px]">{c.full_name}</p>
                              </div>
                              <div className="text-right font-mono">
                                <div className="font-bold text-sm text-text-primary">{c.total_votes.toLocaleString()}</div>
                                <div className="text-xs font-bold" style={{ color }}>{c.vote_percentage}%</div>
                              </div>
                            </div>
                            <div className="w-full bg-primary-100/50 rounded-full h-1.5 pl-2 overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${c.vote_percentage}%`, backgroundColor: color }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Donut Chart */}
                  <div className="bg-white border border-dark-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-display text-sm font-bold text-primary-900 mb-2 flex items-center gap-2">
                      <PieChartIcon className="w-4 h-4 text-primary-700" />
                      Vote Share Distribution
                    </h3>
                    <div className="h-[210px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={activeIndex}
                            activeShape={renderActiveShape}
                            data={currentViewData.candidates}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            dataKey="total_votes"
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            stroke="none"
                          >
                            {currentViewData.candidates?.map((c: CandidateResult, i: number) => (
                              <Cell key={`cell-${i}`} fill={getPartyColor(c.party_code, i)} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right: Map & Geographic Overview */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Cartographic Map */}
                  <div className="bg-white border border-dark-border rounded-xl overflow-hidden relative min-h-[380px] shadow-sm">
                    <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-dark-border shadow-md">
                      <p className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-700" />
                        Gombe State Cartographic Collation Index
                      </p>
                      <p className="text-[10px] text-text-muted mt-0.5">Circles indicate leading party and reporting scale</p>
                    </div>

                    <MapContainer
                      center={[10.2897, 11.1711]}
                      zoom={9}
                      style={{ height: '380px', width: '100%', background: '#f0f4f8' }}
                      zoomControl={false}
                    >
                      <MapController selectedLgaCoords={activeLgaCoords} />
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; CARTO'
                      />
                      {room.lga_breakdown?.map((lga: LGADashboardSummary) => {
                        const coords: Record<string, [number, number]> = {
                          'Akko': [10.2744, 11.0254], 'Balanga': [9.7909, 11.6669], 'Billiri': [9.8659, 11.2227],
                          'Dukku': [10.8245, 10.7722], 'Funakaye': [10.8524, 11.4422], 'Gombe': [10.2897, 11.1711],
                          'Kaltungo': [9.8142, 11.3069], 'Kwami': [10.4566, 11.2384], 'Nafada': [11.0945, 11.3323],
                          'Shongom': [9.7118, 11.2227], 'Yamaltu/Deba': [10.2173, 11.4927]
                        };
                        const c = coords[lga.lga_name];
                        if (!c) return null;

                        const color = getPartyColor(lga.leading_party || '', 0);
                        const isSelected = lga.lga_id === selectedLgaId;
                        const radius = 9 + ((lga.reporting_percentage || 0) / 10);

                        return (
                          <CircleMarker
                            key={lga.lga_id}
                            center={c}
                            radius={isSelected ? radius + 6 : radius}
                            pathOptions={{
                              color: isSelected ? '#1c2c40' : color,
                              fillColor: color,
                              fillOpacity: isSelected ? 0.85 : 0.6,
                              weight: isSelected ? 3 : 1.5
                            }}
                            eventHandlers={{
                              click: () => {
                                setSelectedLgaId(lga.lga_id);
                                setSearchTerm('');
                              }
                            }}
                          >
                            <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                              <div className="bg-white border border-primary-200 p-2.5 rounded-lg shadow-xl text-center min-w-[130px]">
                                <p className="font-bold text-text-primary text-xs">{lga.lga_name} LGA</p>
                                <p className="text-[11px] text-text-muted mt-0.5">
                                  {lga.verified_polling_units} / {lga.total_polling_units} PUs ({lga.reporting_percentage}%)
                                </p>
                                <div className="mt-1 pt-1 border-t border-dark-border text-[11px] font-bold" style={{ color }}>
                                  Lead: {lga.leading_party} ({lga.turnout_percentage}% turnout)
                                </div>
                              </div>
                            </LeafletTooltip>
                          </CircleMarker>
                        );
                      })}
                    </MapContainer>
                  </div>

                  {/* Horizontal Reporting Progress Chart */}
                  <div className="bg-white border border-dark-border rounded-xl p-5 shadow-sm">
                    <h3 className="font-display text-sm font-bold text-primary-900 mb-3 flex items-center justify-between">
                      <span>Reporting Progress Ranking across LGAs</span>
                      <span className="text-xs font-mono font-normal text-text-muted">Target: 100% EC8A Verification</span>
                    </h3>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedLgas} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                          <XAxis type="number" domain={[0, 100]} stroke="#8c9baa" fontSize={10} tickFormatter={(v) => `${v}%`} />
                          <YAxis dataKey="lga_name" type="category" stroke="#1c2c40" fontSize={11} tickLine={false} axisLine={false} width={80} />
                          <RechartsTooltip
                            cursor={{ fill: 'rgba(49,89,138,0.04)' }}
                            contentStyle={{ background: '#ffffff', border: '1px solid #d8e2ef', borderRadius: '6px', fontSize: '12px' }}
                            formatter={(value: any) => [`${value}%`, 'Reporting Progress']}
                          />
                          <Bar dataKey="reporting_percentage" radius={[0, 4, 4, 0]} barSize={12}>
                            {sortedLgas.map((entry, index) => (
                              <Cell
                                key={`bar-${index}`}
                                fill={entry.reporting_percentage >= 80 ? '#10b981' : entry.reporting_percentage >= 40 ? '#31598A' : '#94a3b8'}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data-Dense Analytical Register (LGA or Ward Breakdown) */}
              <div className="bg-white border border-dark-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#fcfdff]">
                  <div>
                    <h3 className="font-display text-lg font-bold text-primary-950 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-700" />
                      {selectedLgaId
                        ? `Ward-Level Electoral Register: ${currentViewData.title}`
                        : 'LGA-Level Electoral Register (All 11 Local Government Areas)'}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5 font-mono">
                      Comprehensive audited metrics: registered voters, accredited electorate, vote tallies, and leading parties.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder={selectedLgaId ? 'Filter by ward name...' : 'Filter by LGA name...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-xs bg-white border border-dark-border rounded-lg outline-none focus:border-primary-500 font-mono w-48 sm:w-56"
                      />
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#f0f4f9] text-text-muted font-extrabold uppercase tracking-wider border-b border-dark-border">
                      <tr>
                        <th className="py-3 px-4">{selectedLgaId ? 'Ward' : 'LGA'}</th>
                        <th className="py-3 px-3 text-right">Registered</th>
                        <th className="py-3 px-3 text-right">Accredited</th>
                        <th className="py-3 px-3 text-right">Votes Cast</th>
                        <th className="py-3 px-3 text-right">Valid Votes</th>
                        <th className="py-3 px-3 text-right">Rejected</th>
                        <th className="py-3 px-3 text-right">Turnout %</th>
                        <th className="py-3 px-3 text-center">Leader</th>
                        <th className="py-3 px-3 text-right">Reporting PUs</th>
                        {!selectedLgaId && <th className="py-3 px-4 text-center">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border">
                      {filteredRegisterRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="py-8 text-center text-text-muted font-sans">
                            No records matching your search query
                          </td>
                        </tr>
                      ) : (
                        filteredRegisterRows.map((row: any, idx: number) => {
                          const name = selectedLgaId ? row.ward_name : row.lga_name;
                          const code = selectedLgaId ? row.ward_code : row.lga_code;
                          const reg = Number(row.total_registered_voters || 0);
                          const accred = Number(row.total_accredited_voters || 0);
                          const cast = Number(row.total_votes_cast || 0);
                          const valid = Number(row.total_valid_votes || 0);
                          const rej = Number(row.rejected_votes || 0);
                          const turnout = row.turnout_percentage || 0;
                          const rep = row.reporting_percentage || 0;
                          const pus = `${row.reported_polling_units || 0} / ${row.total_polling_units || 0}`;
                          const leader = row.leading_party || 'N/A';
                          const partyColor = getPartyColor(leader, 0);

                          return (
                            <tr key={idx} className="hover:bg-primary-50/30 transition-colors">
                              <td className="py-3 px-4 font-bold text-text-primary">
                                <div className="font-sans font-bold text-xs text-primary-950">{name}</div>
                                {code && <div className="text-[10px] text-text-muted font-mono">{code}</div>}
                              </td>
                              <td className="py-3 px-3 text-right">{reg.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right text-accent-700 font-bold">{accred.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-bold">{cast.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right text-text-primary">{valid.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right text-amber-600">{rej.toLocaleString()}</td>
                              <td className="py-3 px-3 text-right font-bold">{turnout}%</td>
                              <td className="py-3 px-3 text-center">
                                <span
                                  className="inline-block px-2 py-0.5 rounded text-[11px] font-extrabold text-white"
                                  style={{ backgroundColor: partyColor }}
                                >
                                  {leader}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <span>{pus}</span>
                                <span className="text-[11px] text-text-muted ml-1">({rep}%)</span>
                              </td>
                              {!selectedLgaId && (
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={() => {
                                      setSelectedLgaId(row.lga_id);
                                      setSearchTerm('');
                                    }}
                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-700 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded transition-colors"
                                  >
                                    Inspect <ChevronRight className="w-3 h-3" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ticker Tape */}
              <div className="bg-white border border-dark-border rounded-xl overflow-hidden py-3 px-4 flex items-center gap-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary-800 font-extrabold whitespace-nowrap text-xs border-r border-dark-border pr-4">
                  <Activity className="w-4 h-4 text-primary-600 animate-pulse" />
                  LIVE RESULTS TICKER
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <motion.div
                    animate={{ x: ['0%', '-50%'] }}
                    transition={{ repeat: Infinity, duration: 24, ease: 'linear' }}
                    className="flex whitespace-nowrap gap-10 text-xs text-text-secondary font-mono"
                  >
                    {[...topCandidates, ...topCandidates].map((c: CandidateResult, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getPartyColor(c.party_code, i) }} />
                        <span className="font-bold text-text-primary">{c.party_code}</span>
                        <span>{c.total_votes?.toLocaleString()} votes</span>
                        <span className="text-text-muted">({c.vote_percentage}%)</span>
                      </span>
                    ))}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
