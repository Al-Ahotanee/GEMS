import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, CartesianGrid, PieChart, Pie, Sector, LineChart, Line, ComposedChart } from 'recharts';
import { Shield, Vote, TrendingUp, MapPin, Users, Share2, Filter, Activity, CheckCircle, Clock, ArrowUpRight, BarChart2, PieChart as PieChartIcon } from 'lucide-react';
import CountUp from 'react-countup';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { publicApi } from '../services/api';
import { CandidateResult, LGADashboardSummary } from '../types';

const COLORS = ['#10b981', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

const getPartyColor = (partyCode: string, index: number) => {
  const map: Record<string, string> = {
    'APC': '#3b82f6',
    'PDP': '#ef4444',
    'NNPP': '#10b981',
    'LP': '#f97316',
    'PRP': '#8b5cf6',
  };
  return map[partyCode?.toUpperCase()] || COLORS[index % COLORS.length];
};

const MapController = ({ selectedLgaCoords }: { selectedLgaCoords: [number, number] | null }) => {
  const map = useMap();
  if (selectedLgaCoords) {
    map.flyTo(selectedLgaCoords, 11, { duration: 1.5 });
  } else {
    map.flyTo([10.2897, 11.1711], 9, { duration: 1.5 }); // Gombe Center
  }
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
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-bold text-xl">
        {payload.party_code}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 10}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" className="font-mono text-sm">{`${value.toLocaleString()}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#9ca3af" className="text-xs">
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export default function SituationRoomPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['situation-room'],
    queryFn: () => publicApi.getSituationRoom(),
    refetchInterval: 15000,
  });

  const room = data?.data?.data;
  const [selectedLgaId, setSelectedLgaId] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GSEM Situation Room',
        text: 'Watch the live verified results for the Gombe State Election!',
        url: window.location.href,
      }).catch(console.error);
    }
  };

  const currentViewData = useMemo(() => {
    if (!room) return null;
    if (!selectedLgaId) return {
      title: 'Gombe State (All LGAs)',
      total_votes_cast: room.total_votes_cast,
      reported_polling_units: room.reported_polling_units,
      total_polling_units: room.total_polling_units,
      turnout_percentage: room.turnout_percentage,
      reporting_percentage: room.reporting_percentage,
      candidates: room.candidates || []
    };

    const lga = room.lga_breakdown?.find((l: LGADashboardSummary) => l.lga_id === selectedLgaId);
    if (!lga) return null;

    const totalLgaVotes = lga.candidates?.reduce((sum: number, c: CandidateResult) => sum + Number(c.total_votes), 0) || 0;
    const lgaCandidates = lga.candidates?.map((c: CandidateResult) => ({
      ...c,
      vote_percentage: totalLgaVotes > 0 ? Number(((Number(c.total_votes) / totalLgaVotes) * 100).toFixed(2)) : 0
    })) || [];

    return {
      title: `${lga.lga_name} LGA`,
      total_votes_cast: totalLgaVotes,
      reported_polling_units: lga.reported_polling_units,
      total_polling_units: lga.total_polling_units,
      turnout_percentage: lga.turnout_percentage || 0,
      reporting_percentage: lga.reporting_percentage,
      candidates: lgaCandidates
    };
  }, [room, selectedLgaId]);

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
    return [...currentViewData.candidates].sort((a, b) => b.total_votes - a.total_votes).slice(0, 3);
  }, [currentViewData]);

  const leadingCandidate = topCandidates[0];
  const margin = topCandidates.length > 1 ? topCandidates[0].total_votes - topCandidates[1].total_votes : 0;

  return (
    <div className="min-h-screen bg-[#050806] text-[#e8f5ee] font-sans selection:bg-accent-500/30">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-900/10 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="bg-black/40 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-900 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 ring-1 ring-white/10">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight">
                SITUATION ROOM
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  LIVE FEED
                </div>
                <span>|</span>
                <Clock className="w-3 h-3" />
                {room?.last_updated ? new Date(room.last_updated).toLocaleTimeString() : 'Connecting...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all text-sm font-medium backdrop-blur-md">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <Link to="/login" className="flex-1 sm:flex-none text-center bg-white text-black hover:bg-gray-200 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
              Agent Login
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            <p className="text-gray-400 font-mono animate-pulse">Initializing Data Stream...</p>
          </div>
        ) : !room || !currentViewData ? (
          <div className="text-center py-20 text-gray-500">No election data currently streaming</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedLgaId || 'state'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
              
              {/* Context Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10 shadow-2xl">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                    {currentViewData.title}
                    {selectedLgaId && (
                      <button onClick={() => setSelectedLgaId(null)} className="text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors border border-white/10">
                        Clear Filter ✕
                      </button>
                    )}
                  </h2>
                  <p className="text-gray-400 text-sm flex items-center gap-2 mt-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    Displaying officially verified EC8A results
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-black/40 rounded-xl p-1 border border-white/5">
                  <Filter className="w-4 h-4 text-gray-400 ml-3" />
                  <select 
                    className="bg-transparent text-white pl-2 pr-8 py-2 outline-none cursor-pointer appearance-none font-medium hover:text-gray-200 transition-colors"
                    value={selectedLgaId || ''}
                    onChange={(e) => setSelectedLgaId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="" className="bg-gray-900">Filter by LGA</option>
                    {sortedLgas.map((l: LGADashboardSummary) => (
                      <option key={l.lga_id} value={l.lga_id} className="bg-gray-900">{l.lga_name} LGA</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Total Valid Votes', value: currentViewData.total_votes_cast, icon: Vote, color: 'from-blue-500/20 to-blue-600/5', border: 'group-hover:border-blue-500/50', iconColor: 'text-blue-400' },
                  { label: 'PUs Reported', value: currentViewData.reported_polling_units, subValue: `/ ${currentViewData.total_polling_units}`, icon: MapPin, color: 'from-purple-500/20 to-purple-600/5', border: 'group-hover:border-purple-500/50', iconColor: 'text-purple-400' },
                  { label: 'Reporting Progress', value: currentViewData.reporting_percentage, isPercent: true, icon: Activity, color: 'from-green-500/20 to-green-600/5', border: 'group-hover:border-green-500/50', iconColor: 'text-green-400' },
                  { label: 'Voter Turnout', value: currentViewData.turnout_percentage, isPercent: true, icon: Users, color: 'from-orange-500/20 to-orange-600/5', border: 'group-hover:border-orange-500/50', iconColor: 'text-orange-400' },
                ].map((kpi, idx) => (
                  <div key={idx} className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 ${kpi.border}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-gray-400 font-medium text-sm mb-2">{kpi.label}</p>
                        <h3 className="text-3xl font-mono font-bold text-white flex items-baseline gap-1">
                          <CountUp end={kpi.value || 0} decimals={kpi.isPercent ? 1 : 0} separator="," duration={2} />
                          {kpi.isPercent && <span className="text-xl">%</span>}
                          {kpi.subValue && <span className="text-lg text-gray-500 font-sans font-normal ml-1">{kpi.subValue}</span>}
                        </h3>
                      </div>
                      <div className={`p-3 bg-white/5 rounded-xl border border-white/10 ${kpi.iconColor}`}>
                        <kpi.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid lg:grid-cols-12 gap-6">
                
                {/* Left Col: Leaderboard & Pie */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Leading Highlight */}
                  {leadingCandidate && (
                    <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-32 h-32" />
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Current Leader</p>
                      <h3 className="text-3xl font-bold text-white mb-1">{leadingCandidate.full_name}</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black">{leadingCandidate.party_code}</span>
                        <span className="font-mono text-xl text-white">{(leadingCandidate.total_votes || 0).toLocaleString()} votes</span>
                      </div>
                      {margin > 0 && (
                        <p className="text-sm text-green-400 flex items-center gap-1">
                          <ArrowUpRight className="w-4 h-4" /> Leading by {(margin).toLocaleString()} votes
                        </p>
                      )}
                    </div>
                  )}

                  {/* Top Candidates List */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                    <h3 className="font-display text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-gray-400" /> Live Standings
                    </h3>
                    <div className="space-y-4">
                      {topCandidates.map((c: CandidateResult, i: number) => {
                        const color = getPartyColor(c.party_code, i);
                        return (
                          <motion.div 
                            key={c.candidate_id} 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all relative overflow-hidden group"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: color }} />
                            <div className="flex justify-between items-end mb-2 relative z-10">
                              <div>
                                <h4 className="font-bold text-lg leading-none text-white">{c.party_code}</h4>
                                <p className="text-xs text-gray-400 mt-1">{c.full_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-xl text-white">{(c.total_votes || 0).toLocaleString()}</p>
                                <p className="text-xs font-mono" style={{ color }}>{c.vote_percentage}%</p>
                              </div>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 mt-2 relative z-10 overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${c.vote_percentage}%` }} 
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className="h-full rounded-full" 
                                style={{ backgroundColor: color }} 
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Middle/Right Col: Map & Distribution */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Map */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden relative flex-1 min-h-[400px] shadow-2xl z-0">
                    <div className="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 shadow-xl">
                      <p className="text-sm font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        Live Geo-Tracking
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Colors indicate leading party</p>
                    </div>
                    <MapContainer center={[10.2897, 11.1711]} zoom={9} style={{ height: '100%', width: '100%', background: '#0a0f0d' }} zoomControl={false}>
                      <MapController selectedLgaCoords={activeLgaCoords} />
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
                        
                        // Determine leading party in this LGA
                        const lgaLeader = lga.candidates && lga.candidates.length > 0 
                          ? [...lga.candidates].sort((a, b) => Number(b.total_votes) - Number(a.total_votes))[0]
                          : null;
                        
                        const color = lgaLeader ? getPartyColor(lgaLeader.party_code, 0) : '#6b7280';
                        
                        const progress = lga.reporting_percentage || 0;
                        const radius = 8 + (progress / 10); // Size based on reporting progress
                        const isSelected = lga.lga_id === selectedLgaId;

                        return (
                          <CircleMarker
                            key={lga.lga_id}
                            center={c}
                            radius={isSelected ? radius + 6 : radius}
                            pathOptions={{ 
                              color: isSelected ? '#fff' : color, 
                              fillColor: color, 
                              fillOpacity: isSelected ? 0.8 : 0.5,
                              weight: isSelected ? 3 : 1 
                            }}
                            eventHandlers={{ click: () => setSelectedLgaId(lga.lga_id) }}
                          >
                            <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip border-0 bg-transparent shadow-none">
                              <div className="bg-black/90 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl text-center min-w-[120px]">
                                <p className="font-bold text-white text-sm mb-1">{lga.lga_name}</p>
                                <p className="text-xs text-gray-400 mb-2">{lga.reported_polling_units} / {lga.total_polling_units} PUs ({progress}%)</p>
                                {lgaLeader && (
                                  <div className="bg-white/10 rounded pt-1 pb-1 px-2 border border-white/5">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">Leading</p>
                                    <p className="font-bold text-sm" style={{ color }}>{lgaLeader.party_code}</p>
                                  </div>
                                )}
                              </div>
                            </LeafletTooltip>
                          </CircleMarker>
                        );
                      })}
                    </MapContainer>
                  </div>

                  {/* Dual Chart Section */}
                  <div className="grid md:grid-cols-2 gap-6 h-[320px]">
                    {/* Vote Distribution Pie Chart */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative">
                      <h3 className="font-display text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4" /> Vote Share Distribution
                      </h3>
                      <div className="flex-1 min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              activeIndex={activeIndex}
                              activeShape={renderActiveShape}
                              data={currentViewData.candidates}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
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

                    {/* Reporting vs Turnout Comparison */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col">
                      <h3 className="font-display text-sm font-bold text-gray-300 mb-4 flex items-center gap-2">
                         Reporting Progress by LGA
                      </h3>
                      <div className="flex-1 w-full overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sortedLgas.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <XAxis type="number" hide domain={[0, 100]} />
                            <YAxis dataKey="lga_name" type="category" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} />
                            <RechartsTooltip 
                              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                              contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                            />
                            <Bar dataKey="reporting_percentage" name="Reporting %" radius={[0, 4, 4, 0]} barSize={16}>
                              {sortedLgas.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.reporting_percentage > 70 ? '#10b981' : entry.reporting_percentage > 30 ? '#3b82f6' : '#6b7280'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticker Tape */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden py-3 px-4 flex items-center gap-4 shadow-xl">
                <div className="flex items-center gap-2 text-primary-400 font-bold whitespace-nowrap text-sm border-r border-white/10 pr-4">
                  <Activity className="w-4 h-4 animate-pulse" /> LIVE FEED
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <motion.div 
                    animate={{ x: ["0%", "-50%"] }} 
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="flex whitespace-nowrap gap-12 text-sm text-gray-300 font-mono"
                  >
                    {[...topCandidates, ...topCandidates].map((c: CandidateResult, i) => (
                      <span key={i} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getPartyColor(c.party_code, i) }} />
                        <span className="font-bold text-white">{c.party_code}</span>
                        <span>{c.total_votes?.toLocaleString()} votes</span>
                        <span className="text-gray-500">({c.vote_percentage}%)</span>
                      </span>
                    ))}
                  </motion.div>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
