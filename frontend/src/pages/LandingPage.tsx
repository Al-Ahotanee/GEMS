import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileCheck2,
  Globe2,
  LockKeyhole,
  MapPin,
  Menu,
  RadioTower,
  ShieldCheck,
  Users,
  Wifi,
  X,
  Zap,
} from 'lucide-react';

const features = [
  { icon: RadioTower, label: 'Live visibility', title: 'A single source of truth', description: 'See operational progress across every LGA, ward, and polling unit from one calm, decision-ready view.' },
  { icon: FileCheck2, label: 'Evidence first', title: 'Every result carries context', description: 'Capture result sheets, location data, submission history, and review actions together—not across disconnected tools.' },
  { icon: ShieldCheck, label: 'Controlled access', title: 'The right people see the right work', description: 'Role-based workflows give agents, officers, coordinators, observers, and administrators clear responsibilities.' },
  { icon: Wifi, label: 'Resilient by design', title: 'Keep working when networks do not', description: 'Offline-aware submission and synchronization help field teams maintain continuity in difficult conditions.' },
  { icon: BarChart3, label: 'Fast decisions', title: 'Turn signals into action', description: 'Surface pending reviews, disputes, anomalies, and collation status before they become blind spots.' },
  { icon: LockKeyhole, label: 'Accountable', title: 'A complete audit trail', description: 'Every sensitive action is attributable, time-stamped, and reviewable by authorized administrators.' },
];

const metrics = [
  { value: '11', label: 'LGAs represented' },
  { value: '131', label: 'Wards mapped' },
  { value: '873', label: 'Polling units configured' },
  { value: '24/7', label: 'Operational visibility' },
];

const lgas = ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba'];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label="GSEM home">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-500 text-dark-bg shadow-lg shadow-accent-500/20">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-xl font-bold tracking-tight text-text-primary">G<span className="text-accent-500">S</span>EM</span>
        <span className="block text-[0.58rem] font-bold uppercase tracking-[0.2em] text-text-muted">Gombe State Election Monitor</span>
      </span>
    </Link>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-bg text-text-primary">
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-white/[0.08] bg-dark-bg/85 shadow-2xl shadow-black/20 backdrop-blur-2xl' : 'bg-transparent'}`}>
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
            <a href="#features" className="text-sm text-text-secondary transition hover:text-text-primary">Platform</a>
            <a href="#coverage" className="text-sm text-text-secondary transition hover:text-text-primary">Coverage</a>
            <a href="#about" className="text-sm text-text-secondary transition hover:text-text-primary">Why GSEM</a>
            <Link to="/situation-room" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition hover:text-accent-300"><RadioTower className="h-4 w-4" /> Situation Room</Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary transition hover:bg-white/[0.06] hover:text-text-primary">Sign in</Link>
            <Link to="/register" className="btn-accent py-2.5">Join the network <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <button type="button" className="rounded-xl border border-white/10 p-2.5 text-text-secondary md:hidden" onClick={() => setMenuOpen((value) => !value)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/[0.08] bg-dark-surface/95 px-5 py-5 backdrop-blur-2xl md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-2">
              <a href="#features" onClick={closeMenu} className="rounded-xl px-4 py-3 text-text-secondary hover:bg-white/[0.05]">Platform</a>
              <a href="#coverage" onClick={closeMenu} className="rounded-xl px-4 py-3 text-text-secondary hover:bg-white/[0.05]">Coverage</a>
              <a href="#about" onClick={closeMenu} className="rounded-xl px-4 py-3 text-text-secondary hover:bg-white/[0.05]">Why GSEM</a>
              <Link to="/situation-room" onClick={closeMenu} className="rounded-xl px-4 py-3 text-accent-400">Open Situation Room</Link>
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-4">
                <Link to="/login" onClick={closeMenu} className="btn-outline">Sign in</Link>
                <Link to="/register" onClick={closeMenu} className="btn-accent">Join network</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative isolate overflow-hidden pb-20 pt-36 sm:pb-28 sm:pt-44">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_20%,rgba(45,127,77,0.25),transparent_30%),radial-gradient(circle_at_10%_10%,rgba(245,200,66,0.11),transparent_24%),linear-gradient(180deg,#08150d_0%,#07110c_72%)]" />
          <div className="absolute -right-40 top-20 -z-10 h-[32rem] w-[32rem] rounded-full border border-primary-400/10 bg-primary-500/[0.04] blur-sm" />
          <div className="absolute -left-48 top-52 -z-10 h-[28rem] w-[28rem] rounded-full border border-accent-500/10 bg-accent-500/[0.03] blur-sm" />
          <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-20">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-accent-500/25 bg-accent-500/[0.08] px-3.5 py-2 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-accent-300"><span className="h-2 w-2 animate-pulse rounded-full bg-green-400" /> Election operations, made visible</div>
              <h1 className="max-w-3xl font-display text-5xl font-bold leading-[0.98] tracking-[-0.05em] text-text-primary sm:text-6xl lg:text-[5.55rem]">Trust the count.<br /><span className="text-accent-400">See the work.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-text-secondary sm:text-xl">GSEM is the operational layer for transparent election monitoring across Gombe State—connecting field evidence, review workflows, collation, and public visibility.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link to="/situation-room" className="btn-accent px-6 py-3.5">Explore the Situation Room <ArrowRight className="h-4 w-4" /></Link>
                <Link to="/register" className="btn-outline px-6 py-3.5">Register as an agent</Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-text-muted"><span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-400" /> Evidence-led workflows</span><span className="inline-flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-accent-400" /> Role-based access</span><span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary-300" /> Built for Gombe</span></div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }} className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-primary-500/[0.06] blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/[0.10] bg-[#0b1a11]/95 shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-accent-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-green-400/80" /></div><span className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-text-muted">Operations / live</span></div>
                <div className="p-5 sm:p-7"><div className="flex items-start justify-between"><div><p className="eyebrow">State overview</p><h2 className="mt-2 font-display text-2xl font-bold">Election readiness</h2></div><span className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/10 px-3 py-1.5 text-xs font-bold text-green-300"><span className="h-1.5 w-1.5 rounded-full bg-green-300" /> Live</span></div><div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3"><p className="font-display text-2xl font-bold text-text-primary">{metric.value}</p><p className="mt-1 text-[0.65rem] leading-4 text-text-muted">{metric.label}</p></div>)}</div><div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/10 p-4"><div className="flex items-center justify-between text-xs"><span className="font-semibold text-text-secondary">Reporting coverage</span><span className="font-mono text-accent-400">68.4%</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full w-[68.4%] rounded-full bg-gradient-to-r from-primary-400 to-accent-400" /></div><div className="mt-4 grid grid-cols-3 gap-3 text-xs"><span><b className="block text-text-primary">598</b><span className="text-text-muted">submitted</span></span><span><b className="block text-text-primary">194</b><span className="text-text-muted">in review</span></span><span><b className="block text-text-primary">81</b><span className="text-text-muted">attention</span></span></div></div><div className="mt-5 flex items-center gap-3 rounded-2xl border border-accent-500/15 bg-accent-500/[0.06] p-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/15 text-accent-300"><Zap className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-text-primary">Designed for the field</p><p className="mt-0.5 text-xs text-text-muted">Evidence, connectivity, and accountability in one flow.</p></div></div></div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="border-y border-white/[0.06] bg-[#09160e]/70 py-24 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="max-w-2xl"><p className="eyebrow">The platform</p><h2 className="section-heading mt-3">Clarity at every layer of the operation.</h2><p className="mt-5 text-lg leading-8 text-text-secondary">A serious monitoring system should reduce uncertainty, not add another dashboard to manage. GSEM brings the critical path into focus.</p></div><div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{features.map((feature, index) => <motion.article key={feature.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ delay: index * 0.05 }} className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-primary-300/35 hover:bg-primary-500/[0.06]"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-500/15 text-primary-200 transition group-hover:bg-accent-500/15 group-hover:text-accent-300"><feature.icon className="h-5 w-5" /></div><p className="mt-6 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-accent-400">{feature.label}</p><h3 className="mt-2 font-display text-xl font-bold text-text-primary">{feature.title}</h3><p className="mt-3 text-sm leading-6 text-text-secondary">{feature.description}</p></motion.article>)}</div></div>
        </section>

        <section id="coverage" className="py-24 sm:py-28"><div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center"><div><p className="eyebrow">Coverage</p><h2 className="section-heading mt-3">Built around the geography teams actually work in.</h2><p className="mt-5 text-lg leading-8 text-text-secondary">From state coordination to the polling unit, the platform keeps geography, responsibility, and progress connected.</p><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{metrics.map((metric) => <div key={metric.label} className="surface-elevated p-4"><p className="font-display text-2xl font-bold text-accent-400">{metric.value}</p><p className="mt-1 text-xs leading-5 text-text-muted">{metric.label}</p></div>)}</div></div><div className="surface-elevated relative overflow-hidden p-6 sm:p-8"><div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary-500/10 blur-3xl" /><div className="relative flex items-center justify-between border-b border-white/[0.08] pb-5"><div><p className="eyebrow">Gombe State</p><h3 className="mt-2 font-display text-2xl font-bold">Operational map</h3></div><MapPin className="h-6 w-6 text-accent-400" /></div><div className="relative mt-6 flex flex-wrap gap-2">{lgas.map((lga, index) => <span key={lga} className={`rounded-xl border px-3 py-2 text-sm ${index === 5 ? 'border-accent-500/30 bg-accent-500/10 text-accent-300' : 'border-white/[0.08] bg-white/[0.03] text-text-secondary'}`}>{lga}</span>)}</div><div className="relative mt-8 flex items-start gap-4 rounded-2xl border border-primary-300/15 bg-primary-500/[0.06] p-4"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-500/20 text-primary-200"><Users className="h-4 w-4" /></div><div><p className="text-sm font-semibold text-text-primary">A shared operating picture</p><p className="mt-1 text-xs leading-5 text-text-muted">Agents submit. Officers review. Coordinators collate. Administrators keep the system accountable.</p></div></div></div></div></section>

        <section id="about" className="border-t border-white/[0.06] bg-gradient-to-b from-[#0a1710] to-[#07110c] py-24 sm:py-28"><div className="mx-auto max-w-7xl px-5 sm:px-8"><div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end"><div><p className="eyebrow">Why GSEM</p><h2 className="section-heading mt-3 max-w-xl">Technology that earns trust by making its work visible.</h2></div><p className="max-w-xl text-lg leading-8 text-text-secondary lg:justify-self-end">GSEM is designed for the moments where accuracy, speed, and accountability have to coexist. Its value is not more noise—it is a clearer chain from field action to public confidence.</p></div><div className="mt-12 grid gap-4 md:grid-cols-3"><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6"><p className="font-display text-4xl font-bold text-accent-400">01</p><h3 className="mt-8 font-display text-lg font-bold">Evidence</h3><p className="mt-3 text-sm leading-6 text-text-secondary">The source record and its supporting context stay close to the workflow.</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6"><p className="font-display text-4xl font-bold text-accent-400">02</p><h3 className="mt-8 font-display text-lg font-bold">Review</h3><p className="mt-3 text-sm leading-6 text-text-secondary">Clear queues and permissions help authorized people resolve issues quickly.</p></div><div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6"><p className="font-display text-4xl font-bold text-accent-400">03</p><h3 className="mt-8 font-display text-lg font-bold">Accountability</h3><p className="mt-3 text-sm leading-6 text-text-secondary">A defensible audit trail makes the system easier to govern and explain.</p></div></div></div></section>

        <section id="situation-room" className="px-5 py-24 sm:px-8 sm:py-28"><div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-accent-500/20 bg-gradient-to-br from-primary-500/20 via-dark-surface to-accent-500/[0.08] p-8 text-center shadow-2xl shadow-black/20 sm:p-14"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-500 text-dark-bg shadow-lg shadow-accent-500/20"><Eye className="h-7 w-7" /></div><p className="eyebrow mt-7">Open visibility</p><h2 className="mx-auto mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">See what is happening, as it happens.</h2><p className="mx-auto mt-5 max-w-xl text-base leading-7 text-text-secondary">Open the public Situation Room for a live view of election monitoring activity across Gombe State.</p><Link to="/situation-room" className="btn-accent mt-8">Open the Situation Room <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>

      <footer className="border-t border-white/[0.07] bg-[#061009]"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between"><div><Logo /><p className="mt-4 max-w-sm text-sm leading-6 text-text-muted">A transparent operational layer for election monitoring across Gombe State.</p></div><div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-text-muted"><Link to="/login" className="transition hover:text-text-primary">Sign in</Link><Link to="/register" className="transition hover:text-text-primary">Agent registration</Link><Link to="/situation-room" className="transition hover:text-text-primary">Situation Room</Link></div></div><div className="mx-auto max-w-7xl border-t border-white/[0.06] px-5 py-5 text-xs text-text-muted sm:px-8">GSEM · Built for clarity, continuity, and public confidence.</div></footer>
    </div>
  );
}
