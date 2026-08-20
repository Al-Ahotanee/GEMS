import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Shield, Vote, BarChart3, MapPin, Users, Eye, Wifi, FileText,
  ChevronRight, ChevronLeft, ArrowRight, CheckCircle, Globe,
  Phone, Mail, Clock, Zap, Lock, TrendingUp, Radio,
} from 'lucide-react';
import CountUp from 'react-countup';

// ==================== GEOMETRIC PATTERNS ====================

const NigerianPattern = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <defs>
      <pattern id="kente" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="transparent" />
        <path d="M0 20 L20 0 L40 20 L20 40Z" stroke="rgba(26,86,50,0.15)" strokeWidth="1" fill="none" />
        <path d="M10 10 L30 10 L30 30 L10 30Z" stroke="rgba(245,200,66,0.1)" strokeWidth="0.5" fill="none" />
        <circle cx="20" cy="20" r="3" fill="rgba(26,86,50,0.08)" />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#kente)" />
  </svg>
);

const GeometricStripes = ({ variant = 'green' }: { variant?: 'green' | 'gold' }) => {
  const color = variant === 'green' ? 'rgba(26,86,50,' : 'rgba(245,200,66,';
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${i * 18}%`,
            left: i % 2 === 0 ? '-5%' : '60%',
            width: i % 2 === 0 ? '50%' : '45%',
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${color}${0.06 + i * 0.02}), transparent)`,
            transform: `rotate(${i % 2 === 0 ? -3 : 3}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const TribalBorder = () => (
  <div className="w-full h-2 relative overflow-hidden">
    <div className="absolute inset-0 flex">
      {[...Array(60)].map((_, i) => (
        <div key={i} className="flex-shrink-0">
          <div
            className="w-4 h-2"
            style={{
              background: i % 3 === 0 ? '#1a5632' : i % 3 === 1 ? '#f5c842' : '#0e311d',
              clipPath: i % 2 === 0 ? 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' : 'polygon(20% 0, 80% 0, 100% 100%, 0 100%)',
            }}
          />
        </div>
      ))}
    </div>
  </div>
);

// ==================== CAROUSEL DATA ====================

const carouselItems = [
  {
    title: 'Real-Time Result Tracking',
    description: 'Monitor results as they arrive from all 11 LGAs across Gombe State. Live dashboards update every 15 seconds.',
    icon: BarChart3,
    stat: '1,200+',
    statLabel: 'Polling Units',
    gradient: 'from-primary-500/20 to-emerald-500/10',
  },
  {
    title: 'Offline-First Architecture',
    description: 'PU agents can submit results without internet connectivity. Data syncs automatically when connection is restored.',
    icon: Wifi,
    stat: '100%',
    statLabel: 'Coverage',
    gradient: 'from-accent-500/20 to-yellow-500/10',
  },
  {
    title: 'Dispute Resolution',
    description: 'Transparent dispute tracking with evidence upload, escalation paths, and full audit trails for accountability.',
    icon: Shield,
    stat: '24/7',
    statLabel: 'Monitoring',
    gradient: 'from-blue-500/20 to-cyan-500/10',
  },
  {
    title: 'Secure Collation',
    description: 'Digital signatures at every level — ward, LGA, and state. Tamper-proof collation with cryptographic verification.',
    icon: Lock,
    stat: '3-Tier',
    statLabel: 'Verification',
    gradient: 'from-purple-500/20 to-pink-500/10',
  },
];

// ==================== FEATURES ====================

const features = [
  { icon: Vote, title: 'Result Submission', desc: 'Photo-verified result sheets with GPS tagging from every polling unit' },
  { icon: Eye, title: 'Public Situation Room', desc: 'Open access live dashboard — anyone can monitor election progress' },
  { icon: Users, title: 'Role-Based Access', desc: '6 distinct roles from PU Agent to Super Admin with granular permissions' },
  { icon: FileText, title: 'Instant Reports', desc: 'Generate PDF, Excel, and CSV reports at any level of aggregation' },
  { icon: TrendingUp, title: 'Anomaly Detection', desc: 'Automatic flagging of statistical anomalies and suspicious patterns' },
  { icon: Radio, title: 'Live Notifications', desc: 'Real-time alerts via in-app, email, SMS, and push notifications' },
];

// ==================== STATS ====================

const stats = [
  { value: 11, suffix: '', label: 'Local Government Areas' },
  { value: 114, suffix: '+', label: 'Electoral Wards' },
  { value: 1200, suffix: '+', label: 'Polling Units' },
  { value: 2.1, suffix: 'M+', label: 'Registered Voters', decimals: 1 },
];

// ==================== LGA LIST ====================

const lgaNames = ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'];

// ==================== MAIN COMPONENT ====================

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);

  return (
    <div className="min-h-screen bg-dark-bg text-text-primary overflow-x-hidden">

      {/* ==================== HEADER ==================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-dark-bg/90 backdrop-blur-xl border-b border-dark-border shadow-2xl shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-accent-500 rounded-full border-2 border-dark-bg animate-pulse" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold tracking-tight">
                  <span className="text-primary-400">G</span>
                  <span className="text-accent-500">S</span>
                  <span className="text-primary-400">EM</span>
                </h1>
                <p className="text-[9px] text-text-muted tracking-[0.2em] uppercase -mt-0.5">Election Monitor</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'Coverage', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm text-text-muted hover:text-text-primary transition-colors relative group"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent-500 group-hover:w-full transition-all duration-300" />
                </a>
              ))}
              <a href="#situation-room" className="text-sm text-accent-500 hover:text-accent-400 transition-colors font-medium">
                Live Room
              </a>
            </nav>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                to="/situation-room"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-accent-500 border border-accent-500/30 rounded-lg hover:bg-accent-500/10 transition-all"
              >
                <Radio className="w-4 h-4" />
                Live Room
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-dark-bg bg-gradient-to-r from-accent-500 to-accent-400 rounded-lg shadow-lg shadow-accent-500/25 hover:shadow-accent-500/40 hover:scale-105 transition-all duration-300"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ==================== TRIBAL ACCENT BAR ==================== */}
      <div className="fixed top-16 lg:top-20 left-0 right-0 z-40">
        <TribalBorder />
      </div>

      {/* ==================== HERO SECTION ==================== */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative min-h-screen flex items-center pt-20"
      >
        {/* Background Patterns */}
        <div className="absolute inset-0">
          <NigerianPattern className="absolute inset-0 w-full h-full opacity-60" />
          <GeometricStripes variant="green" />
          {/* Nigeria flag stripe accent */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500/40 via-white/5 to-primary-500/40" />
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-primary-500/40 via-white/5 to-primary-500/40" />
          {/* Radial glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary-500/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left — Text */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-medium text-primary-300 tracking-wide">2027 GOMBE GUBERNATORIAL ELECTION</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
                <span className="text-text-primary">Counting Every</span>
                <br />
                <span className="bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500 bg-clip-text text-transparent">
                  Vote.
                </span>
                <br />
                <span className="text-text-primary">Protecting Every</span>
                <br />
                <span className="bg-gradient-to-r from-primary-300 via-primary-200 to-primary-300 bg-clip-text text-transparent">
                  Voice.
                </span>
              </h1>

              <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-lg">
                The official election monitoring platform for Gombe State. Track results in real-time across all{' '}
                <span className="text-accent-500 font-semibold">11 LGAs</span>,{' '}
                <span className="text-accent-500 font-semibold">114+ wards</span>, and{' '}
                <span className="text-accent-500 font-semibold">1,200+ polling units</span>.
              </p>

              {/* CTA Row */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <Link
                  to="/situation-room"
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300"
                >
                  <Eye className="w-5 h-5" />
                  View Live Situation Room
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-4 text-primary-200 border border-primary-500/30 rounded-xl hover:bg-primary-500/10 hover:border-primary-500/50 transition-all duration-300 font-medium"
                >
                  <Users className="w-5 h-5" />
                  Join as Agent
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-400" /> INEC Compliant</span>
                <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-primary-300" /> End-to-End Encrypted</span>
                <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-accent-500" /> Open & Transparent</span>
              </div>
            </motion.div>

            {/* Right — Carousel Card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
              className="relative"
            >
              {/* Decorative geometric frame */}
              <div className="absolute -inset-4 rounded-3xl border border-primary-500/10" style={{ clipPath: 'polygon(0 5%, 5% 0, 95% 0, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0 95%)' }} />

              <div className="relative bg-dark-surface/60 backdrop-blur-xl border border-dark-border rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-dark-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary-500 animate-pulse" />
                    <span className="text-xs font-medium text-text-muted tracking-wide uppercase">Platform Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={prevSlide} className="p-1 rounded-md hover:bg-dark-surface-2 text-text-muted hover:text-text-primary transition"><ChevronLeft className="w-4 h-4" /></button>
                    <span className="text-xs text-text-muted font-mono">{currentSlide + 1}/{carouselItems.length}</span>
                    <button onClick={nextSlide} className="p-1 rounded-md hover:bg-dark-surface-2 text-text-muted hover:text-text-primary transition"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>

                {/* Carousel Body */}
                <div className="relative h-72 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentSlide}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 p-6 flex flex-col"
                    >
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${carouselItems[currentSlide].gradient} flex items-center justify-center mb-4 border border-white/5`}>
                        {(() => { const Icon = carouselItems[currentSlide].icon; return <Icon className="w-7 h-7 text-text-primary" />; })()}
                      </div>
                      <h3 className="font-display text-xl font-bold text-text-primary mb-2">
                        {carouselItems[currentSlide].title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed mb-auto">
                        {carouselItems[currentSlide].description}
                      </p>
                      <div className="flex items-end justify-between mt-4 pt-4 border-t border-dark-border">
                        <div>
                          <p className="font-mono text-3xl font-bold text-accent-500">{carouselItems[currentSlide].stat}</p>
                          <p className="text-xs text-text-muted">{carouselItems[currentSlide].statLabel}</p>
                        </div>
                        {/* Progress dots */}
                        <div className="flex gap-1.5">
                          {carouselItems.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentSlide(i)}
                              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-accent-500' : 'w-1.5 bg-dark-surface-3 hover:bg-text-muted'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Floating decorations */}
              <div className="absolute -bottom-6 -right-6 w-24 h-24 border border-accent-500/10 rounded-xl rotate-12" />
              <div className="absolute -top-6 -left-6 w-16 h-16 border border-primary-500/10 rounded-xl -rotate-12" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-xs text-text-muted">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-primary-500/30 flex items-start justify-center p-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-accent-500"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </motion.section>

      {/* ==================== STATS BAR ==================== */}
      <section className="relative py-12 bg-dark-surface/50 border-y border-dark-border">
        <GeometricStripes variant="gold" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="font-mono text-3xl lg:text-4xl font-bold text-accent-500">
                  <CountUp end={stat.value} duration={2.5} decimals={stat.decimals || 0} enableScrollSpy scrollSpyOnce />{stat.suffix}
                </p>
                <p className="text-sm text-text-muted mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <section id="features" className="relative py-20 lg:py-28">
        <NigerianPattern className="absolute inset-0 w-full h-full opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1 rounded-full bg-accent-500/10 text-accent-500 text-xs font-semibold tracking-wider uppercase mb-4">
              Platform Capabilities
            </span>
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
              Enterprise-Grade <span className="text-accent-500">Election Monitoring</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              Built for the unique challenges of Nigerian elections — from rural connectivity gaps to multi-tier verification requirements.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative bg-dark-surface/40 backdrop-blur-sm border border-dark-border rounded-2xl p-6 hover:border-primary-500/30 hover:bg-dark-surface/60 transition-all duration-500"
              >
                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-bl-2xl rounded-tr-2xl">
                  <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-primary-500/10 to-transparent" />
                  <div className="absolute top-1 right-1 w-3 h-3" style={{ background: 'linear-gradient(135deg, #1a5632 50%, transparent 50%)' }} />
                </div>

                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-500/5 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-500/10 transition-all duration-500">
                  <feature.icon className="w-6 h-6 text-primary-300" />
                </div>
                <h3 className="font-display text-lg font-semibold text-text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== NIGERIA STRIPE DIVIDER ==================== */}
      <div className="relative h-20 overflow-hidden">
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-primary-500/15" />
          <div className="flex-1 bg-white/3" />
          <div className="flex-1 bg-primary-500/15" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-transparent to-dark-bg" />
        <div className="absolute inset-0 bg-gradient-to-b from-dark-bg via-transparent to-dark-bg" />
        {/* Geometric overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-accent-500/20 rotate-45" />
          <div className="absolute w-10 h-10 border border-primary-500/20 rotate-45" />
        </div>
      </div>

      {/* ==================== COVERAGE SECTION ==================== */}
      <section id="coverage" className="relative py-20 lg:py-28 bg-dark-surface/30">
        <GeometricStripes variant="green" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — LGA Grid */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4">
                All <span className="text-accent-500">11 LGAs</span> Covered
              </h2>
              <p className="text-text-secondary mb-8">
                Complete coverage of every Local Government Area in Gombe State. Every ward, every polling unit, every vote.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lgaNames.map((lga, i) => (
                  <motion.div
                    key={lga}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group flex items-center gap-2 px-4 py-3 bg-dark-surface/50 border border-dark-border rounded-xl hover:border-primary-500/30 hover:bg-primary-500/5 transition-all cursor-default"
                  >
                    <MapPin className="w-4 h-4 text-primary-400 group-hover:text-accent-500 transition-colors flex-shrink-0" />
                    <span className="text-sm font-medium text-text-primary truncate">{lga}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right — Coverage Visualization */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-dark-surface/60 backdrop-blur-xl border border-dark-border rounded-2xl p-8">
                <h3 className="font-display text-lg font-semibold mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent-500" />
                  Coverage Breakdown
                </h3>
                {[
                  { label: 'LGA Coverage', value: 100, color: '#1a5632' },
                  { label: 'Ward Coverage', value: 100, color: '#22753f' },
                  { label: 'Polling Unit Coverage', value: 100, color: '#f5c842' },
                  { label: 'Agent Deployment', value: 85, color: '#3b82f6' },
                ].map((bar, i) => (
                  <div key={i} className="mb-5 last:mb-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-text-secondary">{bar.label}</span>
                      <span className="text-sm font-mono font-bold text-text-primary">{bar.value}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-dark-surface-3 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${bar.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ background: bar.color }}
                      />
                    </div>
                  </div>
                ))}

                {/* Nigerian geometric accent */}
                <div className="mt-6 pt-4 border-t border-dark-border flex items-center gap-3">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-3 h-3 rotate-45" style={{ background: i % 2 === 0 ? '#1a5632' : '#f5c842', opacity: 0.3 }} />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">Gombe State, Nigeria</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section id="about" className="relative py-20 lg:py-28 overflow-hidden">
        <NigerianPattern className="absolute inset-0 w-full h-full opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-accent-500/5" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Nigerian geometric emblem */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="w-8 h-1 bg-primary-500/40 rounded" />
              <div className="w-4 h-4 rotate-45 border-2 border-accent-500/40" />
              <div className="w-12 h-1 bg-accent-500/40 rounded" />
              <div className="w-4 h-4 rotate-45 border-2 border-primary-500/40" />
              <div className="w-8 h-1 bg-primary-500/40 rounded" />
            </div>

            <h2 className="font-display text-3xl lg:text-5xl font-bold mb-6 leading-tight">
              Transparency is the
              <br />
              <span className="bg-gradient-to-r from-accent-500 to-accent-400 bg-clip-text text-transparent">
                Foundation of Democracy
              </span>
            </h2>
            <p className="text-lg text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              GSEM ensures that every vote in the 2027 Gombe State Gubernatorial Election is counted, verified, and protected.
              Join thousands of agents, observers, and citizens in safeguarding our democracy.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-400 text-dark-bg font-bold rounded-xl shadow-xl shadow-accent-500/25 hover:shadow-accent-500/40 hover:scale-105 transition-all duration-300 text-lg"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/situation-room"
                className="inline-flex items-center gap-3 px-8 py-4 text-primary-200 border-2 border-primary-500/30 rounded-xl hover:bg-primary-500/10 transition-all duration-300 font-semibold text-lg"
              >
                <Eye className="w-5 h-5" />
                Public Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <TribalBorder />
      <footer className="relative bg-dark-surface/80 border-t border-dark-border">
        <NigerianPattern className="absolute inset-0 w-full h-full opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold">
                    <span className="text-primary-400">G</span><span className="text-accent-500">S</span><span className="text-primary-400">EM</span>
                  </h3>
                  <p className="text-[9px] text-text-muted tracking-[0.15em] uppercase">Gombe State Election Monitor</p>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-4">
                Counting Every Vote. Protecting Every Voice. The official monitoring platform for the 2027 Gombe State Gubernatorial Election.
              </p>
              {/* Nigerian geometric accent */}
              <div className="flex gap-1.5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-2 h-2" style={{ background: i % 3 === 0 ? '#1a5632' : i % 3 === 1 ? '#f5c842' : '#0e311d', clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' }} />
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'Situation Room', to: '/situation-room' },
                  { label: 'Sign In', to: '/login' },
                  { label: 'Register as Agent', to: '/register' },
                  { label: 'Features', to: '#features' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-text-muted hover:text-accent-500 transition-colors flex items-center gap-1.5 group">
                      <ChevronRight className="w-3 h-3 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coverage */}
            <div>
              <h4 className="font-display text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Coverage</h4>
              <ul className="space-y-2">
                {lgaNames.slice(0, 6).map((lga) => (
                  <li key={lga} className="text-sm text-text-muted flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-primary-400" /> {lga} LGA
                  </li>
                ))}
                <li className="text-xs text-primary-300 font-medium">+ {lgaNames.length - 6} more LGAs</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display text-sm font-semibold text-text-primary mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm text-text-muted"><Mail className="w-4 h-4 text-primary-400" /> info@gsem.ng</li>
                <li className="flex items-center gap-3 text-sm text-text-muted"><Phone className="w-4 h-4 text-primary-400" /> +234 (0) 803 XXX XXXX</li>
                <li className="flex items-center gap-3 text-sm text-text-muted"><MapPin className="w-4 h-4 text-primary-400" /> Gombe, Gombe State</li>
                <li className="flex items-center gap-3 text-sm text-text-muted"><Clock className="w-4 h-4 text-primary-400" /> Mon – Sun, 24/7</li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              © 2027 GSEM — Gombe State Election Monitor. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-text-muted">Built for Nigeria 🇳🇬</span>
              <div className="flex gap-0.5">
                <div className="w-4 h-3 bg-primary-500 rounded-l-sm" />
                <div className="w-4 h-3 bg-white/80" />
                <div className="w-4 h-3 bg-primary-500 rounded-r-sm" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
