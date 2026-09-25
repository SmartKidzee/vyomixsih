import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Layers,
  Radio,
  BarChart3,
  Languages,
  Waves,
  MapPin,
  CheckCircle2,
  Globe,
  Compass,
} from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/lib/i18n";
import AeroShards from "@/components/reactbits/AeroShards";
import ScrollExpand from "@/components/reactbits/ScrollExpand";
import MagicBento, { type BentoCardItem } from "@/components/reactbits/MagicBento";
import TrueFocus from "@/components/reactbits/TrueFocus";

export default function HomePage() {
  const { t } = useI18n();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Dynamic Bento Cards routed through i18n translation service
  const bentoCards: BentoCardItem[] = [
    {
      color: '#081022',
      title: t('home.bento.c1.title', 'Dual-Spectrum Radar Fusion'),
      description: t('home.bento.c1.desc', 'Synthetic Aperture Radar (SAR) penetrates monsoon clouds, smoke, and darkness for 24/7 all-weather Earth surveillance.'),
      label: t('home.bento.c1.label', 'Optical + SAR'),
      icon: <Layers className="size-5 text-sky-400" />
    },
    {
      color: '#081022',
      title: t('home.bento.c2.title', 'Physical Ground Area Calculus'),
      description: t('home.bento.c2.desc', 'Deterministic quantification (+/- km², m², sq ft) computed directly from Ground Sampling Distance (GSD) resolution.'),
      label: t('home.bento.c2.label', 'GSD Area Math'),
      icon: <BarChart3 className="size-5 text-cyan-400" />
    },
    {
      color: '#081022',
      title: t('home.bento.c3.title', 'Multilingual Indic Voice Engine'),
      description: t('home.bento.c3.desc', 'Query remote sensing imagery via speech recognition in Hindi, Kannada, Tamil, Telugu, and 10+ Indic languages with live audio readout.'),
      label: t('home.bento.c3.label', '10+ Languages'),
      icon: <Languages className="size-5 text-emerald-400" />
    },
    {
      color: '#081022',
      title: t('home.bento.c4.title', 'Bi-Temporal Threat & Change Detection'),
      description: t('home.bento.c4.desc', 'Compare pre- and post-pass satellite imagery to automatically track flood inundation lines, canopy loss, and unauthorized construction.'),
      label: t('home.bento.c4.label', 'Change Detection'),
      icon: <Waves className="size-5 text-indigo-400" />
    },
    {
      color: '#081022',
      title: t('home.bento.c5.title', 'Sub-Meter Coordinate Grounding'),
      description: t('home.bento.c5.desc', 'Pixel-level bounding box spatial localization identifying naval vessels, runways, transport arteries, and building developments.'),
      label: t('home.bento.c5.label', 'Object Detection'),
      icon: <MapPin className="size-5 text-teal-400" />
    },
    {
      color: '#081022',
      title: t('home.bento.c6.title', 'Universal GeoTIFF & Sentinel Ingestion'),
      description: t('home.bento.c6.desc', 'Seamlessly analyze complex remote sensing scenes compatible with GeoTIFF rasters, open geospatial layers, and Sentinel-1/2 products.'),
      label: t('home.bento.c6.label', 'Open GIS'),
      icon: <Globe className="size-5 text-purple-400" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#060b18] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-visible">
      
      {/* ──────────────── FLOATING PILL NAVBAR WITH VYOMIX BRANDING ──────────────── */}
      <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[94%] sm:w-[92%] max-w-5xl rounded-full bg-[#060b18]/85 backdrop-blur-2xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.6)] px-3 sm:px-6 py-2 sm:py-3 transition-all">
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          
          {/* Brand Logo with VYOMIX */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none min-w-0">
            <div className="relative flex size-9 sm:size-10 items-center justify-center rounded-full bg-white/10 border border-cyan-400/30 shadow-lg shadow-cyan-500/20 group-hover:border-cyan-400/60 transition-all p-1.5 sm:p-2 backdrop-blur-md shrink-0">
              <img src="/logo.svg" alt="VYOMIX" className="size-full object-contain" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm sm:text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white uppercase font-sans">
                  {t("nav.vyomix", "VYOMIX")}
                </span>
                <span className="hidden sm:inline-block text-slate-500 font-light">|</span>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-200 tracking-tight truncate">
                  {t("app.title", "Earth Query Lens")}
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[8.5px] sm:text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 shrink-0">
                  {t("nav.sih", "SIH 2026")}
                </span>
              </div>
              <span className="hidden xs:inline-block text-[9.5px] sm:text-[10px] text-slate-400 font-medium tracking-wide truncate">
                {t("nav.tagline", "Multimodal Satellite Intelligence")}
              </span>
            </div>
          </Link>

          {/* Right Header Navigation: Language Switcher + Glassmorphic Launch Studio */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Live Language Switcher supporting 22 Indian languages */}
            <LanguageSwitcher />

            {/* Glassmorphic Launch Studio CTA Button */}
            <Link
              to="/app"
              className="inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-cyan-400/15 hover:bg-cyan-400/25 border border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white font-bold text-xs sm:text-sm tracking-tight transition-all duration-200 backdrop-blur-xl shadow-[0_4px_20px_rgba(56,189,248,0.2)] active:scale-95"
            >
              <span className="hidden xs:inline">{t("nav.launchStudio", "Launch Studio")}</span>
              <span className="xs:hidden">Studio</span>
              <ArrowUpRight className="size-3.5 sm:size-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* ──────────────── HERO SECTION (AEROSHARDS FULL-BLEED) ──────────────── */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-14 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#060b18]">
        
        {/* Full-bleed ReactBits AeroShards component — touch scrolling permitted on phones */}
        <div className="absolute inset-0 z-0 pointer-events-none sm:pointer-events-auto">
          <AeroShards
            backgroundColor="#060b18"
            shardColor="#38bdf8"
            accentColor="#6366f1"
            placement="full"
            flow="stream"
            material="chrome"
            detail="balanced"
            effect="none"
            scale={isMobile ? 1.2 : 1.05}
            spread={isMobile ? 1.0 : 0.9}
            depth={1.1}
            speed={0.8}
            spin={0.7}
            interaction="repel"
            density={isMobile ? 1.4 : 1.3}
            shardSize={isMobile ? 1.25 : 1.1}
            stretch={1.1}
            turbulence={0.9}
            glow={1.2}
            edgeSoftness={2}
            bloom={0.45}
            grain={0.03}
            chromaticAberration={0.005}
            transitionDuration={1.2}
            interactionRadius={1.6}
            interactionStrength={0.6}
            rippleIntensity={1.2}
            holdToGather={true}
          />
        </div>

        {/* Ambient Dark Gradient Vignette for perfect text legibility */}
        <div 
          className="absolute inset-0 z-1 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 90% 70% at 50% 50%, rgba(6, 11, 24, 0.45) 0%, rgba(6, 11, 24, 0.9) 75%, #060b18 100%)"
          }}
        />

        {/* Hero Content Container — Modern Clean Typography */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
          
          {/* Clean Modern Badge */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[11px] sm:text-xs font-mono font-medium mb-5 sm:mb-6 shadow-xl backdrop-blur-md">
            <span>{t("home.hero.badge1", "SMART INDIA HACKATHON 2026")}</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-300">{t("home.hero.badge2", "MULTIMODAL SATELLITE VISION")}</span>
          </div>

          {/* Massive Bold Modern Headline */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[1.08] drop-shadow-2xl break-words">
            <TrueFocus
              sentence={t("home.hero.title1", "SEE THROUGH CLOUDS")}
              manualMode={false}
              blurAmount={5}
              borderColor="#38bdf8"
              glowColor="rgba(56, 189, 248, 0.65)"
              animationDuration={0.6}
              pauseBetweenAnimations={1.2}
              className="text-white"
            />
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300">
              {t("home.hero.title2", "COMMAND ORBITAL")}
            </span>
            <br />
            {t("home.hero.title3", "INTELLIGENCE.")}
          </h1>

          {/* High-Contrast Crisp Subtext */}
          <p className="mt-4 sm:mt-6 text-sm sm:text-xl lg:text-2xl text-slate-200 font-medium max-w-3xl leading-relaxed drop-shadow-md">
            {t("home.hero.desc", "Next-generation Earth observation intelligence fusing Optical & Synthetic Aperture Radar (SAR). Query complex satellite scenes in 22+ languages with native Indic voice grounding.")}
          </p>

          {/* Singular Primary Call-to-Action — Glassmorphic */}
          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link
              to="/app"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 px-7 py-3.5 sm:px-10 sm:py-4.5 rounded-2xl bg-gradient-to-r from-cyan-400/90 via-sky-400/90 to-blue-500/90 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-base sm:text-lg tracking-tight backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_rgba(56,189,248,0.35)] hover:shadow-[0_16px_50px_rgba(56,189,248,0.55)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
            >
              <span>{t("home.hero.cta", "Launch Earth Query Lens")}</span>
              <ArrowRight className="size-5 transition-transform group-hover:translate-x-1.5" />
            </Link>
          </div>

          {/* Modern Technical Telemetry Bar */}
          <div className="mt-10 sm:mt-14 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 transition-all shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1">
                <Radio className="size-3 sm:size-3.5" />
                <span>{t("home.hero.telemetry.radar.title", "RADAR SENSORS")}</span>
              </div>
              <div className="text-xs sm:text-base font-bold text-white">
                {t("home.hero.telemetry.radar.val", "C/L/X-Band SAR")}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {t("home.hero.telemetry.radar.desc", "Cloud-invariant phase")}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-sky-500/40 transition-all shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
                <MapPin className="size-3 sm:size-3.5" />
                <span>{t("home.hero.telemetry.res.title", "GROUND RESOLUTION")}</span>
              </div>
              <div className="text-xs sm:text-base font-bold text-white">
                {t("home.hero.telemetry.res.val", "Sub-Meter Precision")}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {t("home.hero.telemetry.res.desc", "Coordinate bounding boxes")}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 transition-all shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-indigo-400 uppercase tracking-wider mb-1">
                <BarChart3 className="size-3 sm:size-3.5" />
                <span>{t("home.hero.telemetry.calc.title", "PHYSICAL METRICS")}</span>
              </div>
              <div className="text-xs sm:text-base font-bold text-white">
                {t("home.hero.telemetry.calc.val", "Exact Area (km²/m²)")}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {t("home.hero.telemetry.calc.desc", "Deterministic calculus")}
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-emerald-500/40 transition-all shadow-lg">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                <Languages className="size-3 sm:size-3.5" />
                <span>{t("home.hero.telemetry.voice.title", "INDIC VERNACULAR")}</span>
              </div>
              <div className="text-xs sm:text-base font-bold text-white">
                {t("home.hero.telemetry.voice.val", "10+ Languages")}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                {t("home.hero.telemetry.voice.desc", "Native STT + TTS Voice")}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────── SECTION 2: SCROLL EXPAND COMPONENT (PINNED WHILE SCROLLING) ──────────────── */}
      <section className="relative w-full bg-[#060b18] overflow-visible">
        <ScrollExpand
          src="/earth-hero.jpg"
          alt="Earth Orbital Remote Sensing Satellite View"
          title={t("home.scroll.title", "ORBITAL GROUND OBSERVATION")}
          scrollHint={t("home.scroll.hint", "SCROLL TO UNFOLD ORBITAL VIEW ↓")}
          useWindowScroll={true}
          startWidth={isMobile ? 86 : 48}
          startHeight={isMobile ? 48 : 58}
          startRadius={isMobile ? 16 : 24}
          endRadius={0}
          mediaZoom={1.35}
          scrollDistance={isMobile ? 1.2 : 1.6}
          holdDistance={0.5}
          overlayScrim={0.7}
        >
          {/* Overlay Content that fades in over the media once it reaches full bleed */}
          <div className="max-w-4xl text-center space-y-6 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono uppercase tracking-widest border border-cyan-400/40 backdrop-blur-md">
              <Globe className="size-3.5" />
              <span>{t("home.scroll.badge", "SENTINEL & BHUVAN OPEN GIS COMPATIBLE")}</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase leading-tight drop-shadow-xl">
              {t("home.scroll.h1", "EVERY PIXEL AUDITED.")}
              <br />
              {t("home.scroll.h2", "EVERY SATELLITE PASS GROUNDED.")}
            </h2>

            <p className="text-base sm:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
              {t("home.scroll.desc", "From glaciology and glacial lake outbursts to coastal defense monitoring and delta agricultural belts, Earth Query Lens synthesizes optical and radar passes into zero-latency geospatial intelligence.")}
            </p>

            <div className="pt-2">
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base tracking-tight border border-white/30 backdrop-blur-xl transition-all shadow-[0_8px_32px_rgba(0,0,0,0.37)] hover:border-cyan-400/60 active:scale-95"
              >
                <span>{t("home.scroll.cta", "Enter Operational Studio")}</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </ScrollExpand>
      </section>

      {/* ──────────────── SECTION 3: CORE CAPABILITIES WITH REACT BITS MAGIC BENTO ──────────────── */}
      <section className="relative py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Compass className="size-3.5" />
            <span>{t("home.bento.badge", "INTELLIGENCE CAPABILITIES")}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            {t("home.bento.title", "Engineered for Modern Satellite Analytics")}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-400 leading-relaxed">
            {t("home.bento.desc", "Interact with complex multi-sensor Earth observation scenes using physical area modeling and native multi-language voice dictation.")}
          </p>
        </div>

        {/* React Bits Magic Bento Component with subtle reduced tiltFactor */}
        <MagicBento
          cards={bentoCards}
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          tiltFactor={2.0}
          enableMagnetism={true}
          clickEffect={true}
          spotlightRadius={320}
          particleCount={10}
          glowColor="56, 189, 248"
        />
      </section>

      {/* ──────────────── SECTION 4: REAL-WORLD OPERATIONAL WORKFLOWS ──────────────── */}
      <section className="relative py-24 bg-[#070e1e] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase">
              {t("home.wf.badge", "OPERATIONAL IMPACT WORKFLOWS")}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight mt-2">
              {t("home.wf.heading", "From Maritime Security to Climate Resilience")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Workflow 1 */}
            <div className="p-8 rounded-3xl bg-[#091224]/80 backdrop-blur-xl border border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/60">
                {t("home.wf.c1.tag", "CASE STUDY 01")}
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("home.wf.c1.title", "Disaster & Flood Rapid Mapping")}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t("home.wf.c1.desc", "When heavy cloud cover obscures monsoon floods in river basins, SAR radar pulses map surface water inundation within 90 seconds of data upload, calculating flooded roads and isolating vulnerable zones.")}
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("home.wf.c1.p1", "Submerged transport route identification")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("home.wf.c1.p2", "Instant displacement area in km²")}</span>
                </li>
              </ul>
            </div>

            {/* Workflow 2 */}
            <div className="p-8 rounded-3xl bg-[#091224]/80 backdrop-blur-xl border border-white/10 hover:border-sky-500/40 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold text-sky-300 bg-sky-950/60 border border-sky-800/60">
                {t("home.wf.c2.tag", "CASE STUDY 02")}
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("home.wf.c2.title", "Coastal & Maritime Waters Surveillance")}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t("home.wf.c2.desc", "Monitor coastal corridors and maritime zones across sea bodies. Detect non-cooperative vessels through dense fog and sea clutter, cross-referencing synthetic aperture radar targets with navigation telemetry.")}
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("home.wf.c2.p1", "Vessel target coordinates")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("home.wf.c2.p2", "Night-time wake detection")}</span>
                </li>
              </ul>
            </div>

            {/* Workflow 3 */}
            <div className="p-8 rounded-3xl bg-[#091224]/80 backdrop-blur-xl border border-white/10 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 space-y-4">
              <div className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold text-indigo-300 bg-indigo-950/60 border border-indigo-800/60">
                {t("home.wf.c3.tag", "CASE STUDY 03")}
              </div>
              <h3 className="text-xl font-bold text-white">
                {t("home.wf.c3.title", "Forest Canopy & Land Encroachment Auditing")}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {t("home.wf.c3.desc", "Empower environmental conservation teams to identify illegal clearings in protected biosphere reserves. Automatically compute canopy density loss in square feet with verifiable bounding boxes for regulatory action.")}
              </p>
              <ul className="space-y-2 text-xs text-slate-400 pt-2 border-t border-white/5 font-mono">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("home.wf.c3.p1", "Canopy density change tracking")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-400" />
                  <span>{t("home.wf.c3.p2", "Automated forensic PDF report")}</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ──────────────── SECTION 5: FINAL MISSION-READY CTA BANNER (NON-AI-SLOPPY & GLASSMORPHIC) ──────────────── */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-[#0c1836]/80 to-[#060c1d]/90 backdrop-blur-2xl border border-cyan-500/30 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.7)] text-center">
          
          {/* Subtle Grid Accent */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)",
              backgroundSize: "28px 28px"
            }}
          />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 backdrop-blur-md">
              {t("home.final.tag", "MISSION READY · SIH 2026")}
            </span>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight drop-shadow-xl">
              {t("home.final.title", "Deploy Orbital Ground Truth at Scale")}
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {t("home.final.desc", "From disaster perimeter mapping to defense vessel localization, Vyomix equips command centers and field personnel with verifiable, multi-band satellite quantification in seconds.")}
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-200 hover:text-white font-bold text-base tracking-tight border border-cyan-400/50 hover:border-cyan-300 backdrop-blur-xl shadow-[0_8px_32px_rgba(56,189,248,0.25)] hover:shadow-[0_12px_40px_rgba(56,189,248,0.45)] transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <span>{t("home.final.cta", "Launch Vyomix Operational Studio")}</span>
                <ArrowRight className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── GLASSMORPHIC MODERN FOOTER ──────────────── */}
      <footer className="relative mt-8 mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-b from-[#09142b]/80 to-[#040814]/90 backdrop-blur-2xl border border-white/15 shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3.5">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-white/10 border border-white/20 p-2 shadow-lg backdrop-blur-md">
              <img src="/logo.svg" alt="VYOMIX" className="size-full object-contain" />
            </div>
            <div>
              <div className="text-base font-black text-white tracking-wide">
                VYOMIX <span className="text-slate-400 font-normal">· {t("home.footer.brand", "Earth Query Lens")}</span>
              </div>
              <div className="text-xs text-cyan-400 font-mono">
                {t("home.footer.sih", "Smart India Hackathon (SIH 2026) Initiative")}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-slate-300 font-mono">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              {t("home.footer.b1", "Open GIS & Satellite Pipeline")}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              {t("home.footer.b2", "Optical + SAR Dual Spectrum")}
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              {t("home.footer.b3", "22+ Indic Languages")}
            </span>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {t("home.footer.copy", "© 2026 Vyomix · Earth Query Lens. All rights reserved.")}
          </div>
        </div>
      </footer>

    </div>
  );
}
