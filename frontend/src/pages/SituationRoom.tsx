/* Quiet Atlas: a cloud-white public operations map with cobalt wayfinding and moss live-status signals. */
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
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#183f73" className="font-bold text-xl">
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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#183f73" className="font-mono text-sm">{`${value.toLocaleString()}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#607186" className="text-xs">
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
    <div className="min-h-screen bg-dark-bg text-text-primary font-sans selection:bg-primary-100 atlas-grid">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0"><div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100/60 blur-[120px]" /><div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-100/55 blur-[120px]" /></div>

      {/* Header */}
      <div className="bg-dark-surface/90 backdrop-blur-xl border-b border-dark-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-900/15">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-semibold text-primary-800 tracking-tight">
                SITUATION ROOM
              </h1>
              <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-accent-50 text-accent-700 border border-accent-200">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-60"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
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
            <button onClick={handleShare} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-dark-surface-2 border border-dark-border hover:border-primary-300 hover:bg-primary-50 transition-all text-sm font-bold text-text-secondary">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <Link to="/login" className="btn-primary flex-1 sm:flex-none text-center px-5 py-2.5">
              Agent Login
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-16 h-16 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-text-muted font-mono animate-pulse">Initializing Data Stream...</p>
          </div>
        ) : !room || !currentViewData ? (
          <div className="text-center py-20 text-text-muted">No election data currently streaming</div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedLgaId || 'state'} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }} className="space-y-6">
              
              {/* Context Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 surface-elevated p-5 sm:p-6">
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight text-text-primary flex items-center gap-3">
                    {currentViewData.title}
                    {selectedLgaId && (
                      <button onClick={() => setSelectedLgaId(null)} className="text-xs font-bold bg-primary-50 hover:bg-primary-100 text-primary-700 px-3 py-1 rounded-full transition-colors border border-primary-200">
                        Clear Filter ✕
                      </button>
                    )}
                  </h2>
                  <p className="text-text-muted text-sm flex items-center gap-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-accent-600" />
                    Displaying officially verified EC8A results
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-dark-surface-2 rounded-xl p-1 border border-dark-border">
                  <Filter className="w-4 h-4 text-primary-600 ml-3" />
                  <select 
                    className="bg-transparent text-text-primary pl-2 pr-8 py-2 outline-none cursor-pointer appearance-none font-bold hover:text-primary-700 transition-colors"
                    value={selectedLgaId || ''}
                    onChange={(e) => setSelectedLgaId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="" className="bg-white">Filter by LGA</option>
                    {sortedLgas.map((l: LGADashboardSummary) => (
                      <option key={l.lga_id} value={l.lga_id} className="bg-white">{l.lga_name} LGA</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  { label: 'Total Valid Votes', value: currentViewData.total_votes_cast, icon: Vote, color: 'from-primary-50 to-white', border: 'group-hover:border-primary-300', iconColor: 'text-primary-600' },
                  { label: 'PUs Reported', value: currentViewData.reported_polling_units, subValue: `/ ${currentViewData.total_polling_units}`, icon: MapPin, color: 'from-yellow-50 to-white', border: 'group-hover:border-yellow-300', iconColor: 'text-status-warning' },
                  { label: 'Reporting Progress', value: currentViewData.reporting_percentage, isPercent: true, icon: Activity, color: 'from-accent-50 to-white', border: 'group-hover:border-accent-300', iconColor: 'text-accent-600' },
                  { label: 'Voter Turnout', value: currentViewData.turnout_percentage, isPercent: true, icon: Users, color: 'from-primary-50 to-white', border: 'group-hover:border-primary-300', iconColor: 'text-primary-600' },
                ].map((kpi, idx) => (
                  <div key={idx} className={`bg-dark-surface border border-dark-border rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 shadow-sm ${kpi.border}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className="relative z-10 flex items-start justify-between">
                      <div>
                        <p className="text-text-muted font-extrabold uppercase tracking-[.12em] text-[.63rem] mb-2">{kpi.label}</p>
                        <h3 className="text-3xl font-mono font-bold text-text-primary flex items-baseline gap-1">
                          <CountUp end={kpi.value || 0} decimals={kpi.isPercent ? 1 : 0} separator="," duration={2} />
                          {kpi.isPercent && <span className="text-xl">%</span>}
                          {kpi.subValue && <span className="text-lg text-text-muted font-sans font-normal ml-1">{kpi.subValue}</span>}
                        </h3>
                      </div>
                      <div className={`p-3 bg-dark-surface-2 rounded-xl border border-dark-border ${kpi.iconColor}`}>
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
                    <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-32 h-32" />
                      </div>
                      <p className="text-[.63rem] font-extrabold text-text-muted uppercase tracking-[.14em] mb-2">Current Leader</p>
                      <h3 className="font-display text-3xl font-semibold text-text-primary mb-1">{leadingCandidate.full_name}</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary-700 text-white">{leadingCandidate.party_code}</span>
                        <span className="font-mono text-xl text-text-primary">{(leadingCandidate.total_votes || 0).toLocaleString()} votes</span>
                      </div>
                      {margin > 0 && (
                        <p className="text-sm font-bold text-accent-700 flex items-center gap-1">
                          <ArrowUpRight className="w-4 h-4" /> Leading by {(margin).toLocaleString()} votes
                        </p>
                      )}
                    </div>
                  )}

                  {/* Top Candidates List */}
                  <div className="surface-elevated p-6">
                    <h3 className="font-display text-lg font-semibold text-text-primary mb-6 flex items-center gap-2">
                      <BarChart2 className="w-5 h-5 text-primary-600" /> Live Standings
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
                            className="p-4 rounded-xl bg-dark-surface-2/60 border border-dark-border hover:border-primary-300 transition-all relative overflow-hidden group"
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: color }} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{ backgroundColor: color }} />
                            <div className="flex justify-between items-end mb-2 relative z-10">
                              <div>
                                <h4 className="font-bold text-lg leading-none text-text-primary">{c.party_code}</h4>
                                <p className="text-xs text-text-muted mt-1">{c.full_name}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-xl text-text-primary">{(c.total_votes || 0).toLocaleString()}</p>
                                <p className="text-xs font-mono" style={{ color }}>{c.vote_percentage}%</p>
                              </div>
                            </div>
                            <div className="w-full bg-primary-100 rounded-full h-1.5 mt-2 relative z-10 overflow-hidden">
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
                  <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden relative flex-1 min-h-[400px] shadow-lg shadow-primary-900/5 z-0">
                    <div className="absolute top-4 left-4 z-[400] bg-dark-surface/95 backdrop-blur-md px-4 py-2 rounded-xl border border-dark-border shadow-lg">
                      <p className="text-sm font-bold text-text-primary flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        Live Geo-Tracking
                      </p>
                      <p className="text-xs text-text-muted mt-1">Colors indicate leading party</p>
                    </div>
                    <MapContainer center={[10.2897, 11.1711]} zoom={9} style={{ height: '100%', width: '100%', background: '#e8eff5' }} zoomControl={false}>
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
                            color: isSelected ? '#183f73' : color, 
                              fillColor: color, 
                              fillOpacity: isSelected ? 0.8 : 0.5,
                              weight: isSelected ? 3 : 1 
                            }}
                            eventHandlers={{ click: () => setSelectedLgaId(lga.lga_id) }}
                          >
                            <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} className="custom-tooltip border-0 bg-transparent shadow-none">
                              <div className="bg-white/95 backdrop-blur-md border border-primary-200 p-3 rounded-xl shadow-2xl text-center min-w-[120px]">
                                <p className="font-bold text-text-primary text-sm mb-1">{lga.lga_name}</p>
                                <p className="text-xs text-text-muted mb-2">{lga.reported_polling_units} / {lga.total_polling_units} PUs ({progress}%)</p>
                                {lgaLeader && (
                                  <div className="bg-primary-50 rounded pt-1 pb-1 px-2 border border-primary-100">
                                    <p className="text-[10px] text-text-muted uppercase tracking-wider mb-0.5">Leading</p>
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
                    <div className="surface-elevated p-6 flex flex-col relative">
                      <h3 className="font-display text-sm font-semibold text-text-secondary mb-2 flex items-center gap-2">
                        <PieChartIcon className="w-4 h-4 text-primary-600" /> Vote Share Distribution
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
                    <div className="surface-elevated p-6 flex flex-col">
                      <h3 className="font-display text-sm font-semibold text-text-secondary mb-4 flex items-center gap-2">
                         Reporting Progress by LGA
                      </h3>
                      <div className="flex-1 w-full overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sortedLgas.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                            <XAxis type="number" hide domain={[0, 100]} />
                            <YAxis dataKey="lga_name" type="category" stroke="#607186" fontSize={11} tickLine={false} axisLine={false} />
                            <RechartsTooltip 
                              cursor={{ fill: 'rgba(49,89,138,0.06)' }}
                              contentStyle={{ background: '#ffffff', border: '1px solid #d8e2ef', borderRadius: '8px', color: '#1c2c40' }} 
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
              <div className="bg-dark-surface border border-dark-border rounded-xl overflow-hidden py-3 px-4 flex items-center gap-4 shadow-sm">
                <div className="flex items-center gap-2 text-primary-700 font-extrabold whitespace-nowrap text-sm border-r border-dark-border pr-4">
                  <Activity className="w-4 h-4 animate-pulse" /> LIVE FEED
                </div>
                <div className="flex-1 overflow-hidden relative">
                  <motion.div 
                    animate={{ x: ["0%", "-50%"] }} 
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                    className="flex whitespace-nowrap gap-12 text-sm text-text-secondary font-mono"
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
      </div>
    </div>
  );
}
