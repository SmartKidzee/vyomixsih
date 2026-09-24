import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { batchTranslateUI, translateViaGoogleGTX } from "@/services/translationService";

export type Language =
  | "en" | "as" | "bn" | "brx" | "doi" | "gom" | "gu" | "hi"
  | "kn" | "ks" | "mai" | "ml" | "mni" | "mr" | "ne" | "or"
  | "pa" | "sa" | "sat" | "sd" | "ta" | "te" | "ur";

export const LANGUAGES: { code: Language; label: string; nativeLabel: string }[] = [
  { code: "en",  label: "English",    nativeLabel: "English" },
  { code: "as",  label: "Assamese",   nativeLabel: "অসমীয়া" },
  { code: "bn",  label: "Bengali",    nativeLabel: "বাংলা" },
  { code: "brx", label: "Bodo",       nativeLabel: "बड़ो" },
  { code: "doi", label: "Dogri",      nativeLabel: "डोगरी" },
  { code: "gom", label: "Konkani",    nativeLabel: "कोंकणी" },
  { code: "gu",  label: "Gujarati",   nativeLabel: "ગુજરાતી" },
  { code: "hi",  label: "Hindi",      nativeLabel: "हिन्दी" },
  { code: "kn",  label: "Kannada",    nativeLabel: "ಕನ್ನಡ" },
  { code: "ks",  label: "Kashmiri",   nativeLabel: "कॉशुर" },
  { code: "mai", label: "Maithili",   nativeLabel: "मैथिली" },
  { code: "ml",  label: "Malayalam",  nativeLabel: "മലയാളം" },
  { code: "mni", label: "Manipuri",   nativeLabel: "মৈতৈলোন্" },
  { code: "mr",  label: "Marathi",    nativeLabel: "मराठी" },
  { code: "ne",  label: "Nepali",     nativeLabel: "नेपाली" },
  { code: "or",  label: "Odia",       nativeLabel: "ଓଡ଼ିଆ" },
  { code: "pa",  label: "Punjabi",    nativeLabel: "ਪੰਜਾਬੀ" },
  { code: "sa",  label: "Sanskrit",   nativeLabel: "संस्कृतम्" },
  { code: "sat", label: "Santali",    nativeLabel: "ᱥᱟᱱᱛᱟᱲᱤ" },
  { code: "sd",  label: "Sindhi",     nativeLabel: "سنڌي" },
  { code: "ta",  label: "Tamil",      nativeLabel: "தமிழ்" },
  { code: "te",  label: "Telugu",     nativeLabel: "తెలుగు" },
  { code: "ur",  label: "Urdu",       nativeLabel: "اردو" },
];

// Translation keys
const translations: Partial<Record<Language, Record<string, string>>> = {
  en: {
    "app.title": "Earth Query Lens",
    "app.subtitle": "Multimodal Geospatial AI",
    "nav.chat": "Chat",
    "nav.map": "Map",
    "nav.newChat": "New Chat",
    "sidebar.chats": "Chats",
    "sidebar.noChats": "No previous chats.",
    "sidebar.deleteChat": "Delete Chat",
    "settings.title": "Configuration",
    "settings.geminiKey": "API Key 1",
    "settings.gradioUrl": "GeoChat Gradio URL",
    "settings.cancel": "Cancel",
    "settings.save": "Save",
    "input.placeholder.empty": "Ask about your satellite imagery...",
    "input.placeholder.followup": "Ask follow-up questions or drag to map...",
    "input.formats": "Supports GeoTIFF · TIFF · PNG · JPEG · BigEarth · JP2 · SAR",
    "input.attach": "Attach imagery (max 2 for bi-temporal)",
    "drop.title": "Drop images to upload",
    "drop.subtitle": "Supports TIFF, JPG, and PNG files",
    "map.selectRegion": "Select Region",
    "map.drawInstruction": "Click and drag to draw a box.",
    "map.panInstruction": "Pan and zoom, or draw a new region.",
    "map.drawArea": "Draw Area",
    "map.cancelDrawing": "Cancel Drawing",
    "map.sendToChat": "Send to Chat",
    "map.capturing": "Capturing...",
    "map.useLocation": "Use Live Location",
    "map.locating": "Getting location...",
    "map.locationError": "Location access denied",
    "map.locationHint": "Your browser will ask for permission to access GPS",
    "confidence": "Confidence",
    "evidence": "Evidence",
    "executionTrace": "Execution Trace",
    "processing": "Processing...",
    "initializing": "Initializing...",
    "translating": "Translating response...",
    "biTemporal": "Bi-temporal mode",
    "preEvent": "T1: Pre-event",
    "postEvent": "T2: Post-event",
    "changeDetected": "⚠ Significant Change Detected",
    "noChange": "✓ No Significant Change",
    "estimatedArea": "Estimated Affected Area",
    "language": "Language",
    "chart.title": "Temporal Change Analysis",
    "chart.vegetation": "Vegetation Canopy",
    "chart.urban": "Urban / Built Area",
    "chart.water": "Water Bodies",
    "chart.barren": "Undisturbed Terrain",
    "chart.preEvent": "Pre-Event (T1)",
    "chart.postEvent": "Post-Event (T2)",
    "chart.bar": "Bar Chart",
    "chart.spline": "Spline Curve",
    "chart.radar": "Radar Graph",
    "chart.all": "All Views",
    "chart.highlighted": "Highlighted Features",
    "clickToPreview": "Click to preview",
    "map.bitemporalToggle": "Bi-Temporal Timeline",
    "map.splitActive": "Split View Active",
    "map.t1Baseline": "T1 (Baseline)",
    "map.t2Observation": "T2 (Observation)",
    "map.preset15yr": "15 Yrs Ago",
    "map.preset10yr": "10 Yrs Ago",
    "map.preset5yr": "5 Yrs Ago",
    "map.preset1yr": "1 Yr Ago",
    "map.sensorModis": "NASA MODIS (2000-Now)",
    "map.sensorViirs": "NASA VIIRS (2012-Now)",
    "map.dragToCompare": "Drag slider to compare",
    "map.capturingBitemporal": "Capturing T1 & T2...",
    "map.sarOpticalToggle": "SAR vs Optical Dual View",
    "map.sarOpticalActive": "SAR & Optical Dual View Active",
    "map.capturingOpticalSar": "Capturing Optical & SAR Sensors...",
    "map.benchmarks": "Curated Benchmarks",
    "map.layerOptical": "Optical Band (Sentinel-2 / High-Res)",
    "map.layerSar": "SAR Radar (Sentinel-1 Microwave C-Band)",
    "sarOptical.onnxPipeline": "In-Browser ONNX ML Pipeline",
    "sarOptical.opticalTitle": "Optical Multi-Spectral Indices",
    "sarOptical.sarTitle": "SAR Synthetic Aperture Radar",
    "sarOptical.synergyTitle": "Cross-Modality Synergy & Fusion Insights",
    "telemetry.analyzing": "Inferring multi-band cross-temporal changes & geospatial telemetry...",
    "telemetry.passActive": "SPECTRAL PASS ACTIVE",
    "map.bitemporal": "Bi-Temporal",
    "map.sarOptical": "SAR & Optical",
    "map.bitemporalDesc": "Select any era for Left and Right. Drag curtain to compare. Click 'Auto-Capture Both Views' to send to AI.",
    "map.sarOpticalDesc": "Drag curtain to observe microwave cloud penetration and backscatter differences between Optical and SAR.",
    "map.captureBitemporal": "Auto-Capture Both Views",
    "map.captureSarOptical": "Capture Optical & SAR Pair",
    "map.leftOptical": "Left (Optical)",
    "map.rightSar": "Right (SAR Radar)",
    "map.leftT1": "Left View (T1)",
    "map.rightT2": "Right View (T2)",
    "map.dragToComparePrompt": "Drag curtain left / right to compare",
    "map.opticalMulti": "Optical Multispectral",
    "map.sarRadar": "Synthetic Aperture Radar (SAR)",
    "map.historicalArchives": "Historical Archives",
    "benchmark.assam": "Assam Floods",
    "benchmark.assamDesc": "Cloud Penetration & Flood Extent",
    "benchmark.mumbai": "Mumbai Coastal",
    "benchmark.mumbaiDesc": "Double-Bounce Urban Radar",
    "benchmark.kerala": "Kerala Landslides",
    "benchmark.keralaDesc": "Surface Roughness & Soil Moisture",
    "benchmark.sundarbans": "Sundarbans Delta",
    "benchmark.sundarbansDesc": "Tidal Channels & Mangrove Canopy",
    "voice.listening": "Listening to your voice...",
    "voice.speakPrompt": "Read prompt aloud (TTS)",
    "voice.speakResponse": "Read analysis aloud (TTS)",
    "voice.stopSpeaking": "Stop speaking",

    // ──────────────── TOP BAR & BRAND ────────────────
    "nav.vyomix": "VYOMIX",
    "nav.launchStudio": "Launch Studio",
    "nav.tagline": "Multimodal Satellite Intelligence",
    "nav.sih": "SIH 2026",
    "nav.home": "Home",

    // ──────────────── HERO SECTION ────────────────
    "home.hero.badge1": "SMART INDIA HACKATHON 2026",
    "home.hero.badge2": "MULTIMODAL SATELLITE VISION",
    "home.hero.title1": "SEE THROUGH CLOUDS.",
    "home.hero.title2": "COMMAND ORBITAL",
    "home.hero.title3": "INTELLIGENCE.",
    "home.hero.desc": "Next-generation Earth observation intelligence fusing Optical & Synthetic Aperture Radar (SAR). Query complex satellite scenes in 22+ languages with native Indic voice grounding.",
    "home.hero.cta": "Launch Earth Query Lens",
    
    // Telemetry cards
    "home.hero.telemetry.radar.title": "RADAR SENSORS",
    "home.hero.telemetry.radar.val": "C/L/X-Band SAR",
    "home.hero.telemetry.radar.desc": "Cloud-invariant phase",
    "home.hero.telemetry.res.title": "GROUND RESOLUTION",
    "home.hero.telemetry.res.val": "Sub-Meter Precision",
    "home.hero.telemetry.res.desc": "Coordinate bounding boxes",
    "home.hero.telemetry.calc.title": "PHYSICAL METRICS",
    "home.hero.telemetry.calc.val": "Exact Area (km²/m²)",
    "home.hero.telemetry.calc.desc": "Deterministic calculus",
    "home.hero.telemetry.voice.title": "INDIC VERNACULAR",
    "home.hero.telemetry.voice.val": "10+ Languages",
    "home.hero.telemetry.voice.desc": "Native STT + TTS Voice",

    // ──────────────── SCROLL EXPAND SECTION ────────────────
    "home.scroll.title": "ORBITAL GROUND OBSERVATION",
    "home.scroll.hint": "SCROLL TO UNFOLD ORBITAL VIEW ↓",
    "home.scroll.badge": "SENTINEL & BHUVAN OPEN GIS COMPATIBLE",
    "home.scroll.h1": "EVERY PIXEL AUDITED.",
    "home.scroll.h2": "EVERY SATELLITE PASS GROUNDED.",
    "home.scroll.desc": "From glaciology and glacial lake outbursts to coastal defense monitoring and delta agricultural belts, Earth Query Lens synthesizes optical and radar passes into zero-latency geospatial intelligence.",
    "home.scroll.cta": "Enter Operational Studio",

    // ──────────────── MAGIC BENTO SECTION ────────────────
    "home.bento.badge": "INTELLIGENCE CAPABILITIES",
    "home.bento.title": "Engineered for Modern Satellite Analytics",
    "home.bento.desc": "Interact with complex multi-sensor Earth observation scenes using physical area modeling and native multi-language voice dictation.",
    "home.bento.c1.title": "Dual-Spectrum Radar Fusion",
    "home.bento.c1.desc": "Synthetic Aperture Radar (SAR) penetrates monsoon clouds, smoke, and darkness for 24/7 all-weather Earth surveillance.",
    "home.bento.c1.label": "Optical + SAR",
    "home.bento.c2.title": "Physical Ground Area Calculus",
    "home.bento.c2.desc": "Deterministic quantification (+/- km², m², sq ft) computed directly from Ground Sampling Distance (GSD) resolution.",
    "home.bento.c2.label": "GSD Area Math",
    "home.bento.c3.title": "Multilingual Indic Voice Engine",
    "home.bento.c3.desc": "Query remote sensing imagery via speech recognition in Hindi, Kannada, Tamil, Telugu, and 10+ Indic languages with live audio readout.",
    "home.bento.c3.label": "10+ Languages",
    "home.bento.c4.title": "Bi-Temporal Threat & Change Detection",
    "home.bento.c4.desc": "Compare pre- and post-pass satellite imagery to automatically track flood inundation lines, canopy loss, and unauthorized construction.",
    "home.bento.c4.label": "Change Detection",
    "home.bento.c5.title": "Sub-Meter Coordinate Grounding",
    "home.bento.c5.desc": "Pixel-level bounding box spatial localization identifying naval vessels, runways, transport arteries, and building developments.",
    "home.bento.c5.label": "Object Detection",
    "home.bento.c6.title": "Universal GeoTIFF & Sentinel Ingestion",
    "home.bento.c6.desc": "Seamlessly analyze complex remote sensing scenes compatible with GeoTIFF rasters, open geospatial layers, and Sentinel-1/2 products.",
    "home.bento.c6.label": "Open GIS",

    // ──────────────── WORKFLOWS / CASE STUDIES ────────────────
    "home.wf.badge": "OPERATIONAL IMPACT WORKFLOWS",
    "home.wf.heading": "From Maritime Security to Climate Resilience",
    "home.wf.c1.tag": "CASE STUDY 01",
    "home.wf.c1.title": "Disaster & Flood Rapid Mapping",
    "home.wf.c1.desc": "When heavy cloud cover obscures monsoon floods in river basins, SAR radar pulses map surface water inundation within 90 seconds of data upload, calculating flooded roads and isolating vulnerable zones.",
    "home.wf.c1.p1": "Submerged transport route identification",
    "home.wf.c1.p2": "Instant displacement area in km²",
    "home.wf.c2.tag": "CASE STUDY 02",
    "home.wf.c2.title": "Coastal & Maritime Waters Surveillance",
    "home.wf.c2.desc": "Monitor coastal corridors and maritime zones across sea bodies. Detect non-cooperative vessels through dense fog and sea clutter, cross-referencing synthetic aperture radar targets with navigation telemetry.",
    "home.wf.c2.p1": "Vessel target coordinates",
    "home.wf.c2.p2": "Night-time wake detection",
    "home.wf.c3.tag": "CASE STUDY 03",
    "home.wf.c3.title": "Forest Canopy & Land Encroachment Auditing",
    "home.wf.c3.desc": "Empower environmental conservation teams to identify illegal clearings in protected biosphere reserves. Automatically compute canopy density loss in square feet with verifiable bounding boxes for regulatory action.",
    "home.wf.c3.p1": "Canopy density change tracking",
    "home.wf.c3.p2": "Automated forensic PDF report",

    // ──────────────── FINAL SECTION (NON-AI-SLOPPY) ────────────────
    "home.final.tag": "MISSION READY · SIH 2026",
    "home.final.title": "Deploy Orbital Ground Truth at Scale",
    "home.final.desc": "From disaster perimeter mapping to defense vessel localization, Vyomix equips command centers and field personnel with verifiable, multi-band satellite quantification in seconds.",
    "home.final.cta": "Launch Vyomix Operational Studio",

    // ──────────────── FOOTER ────────────────
    "home.footer.brand": "Earth Query Lens",
    "home.footer.sih": "Smart India Hackathon (SIH 2026) Initiative",
    "home.footer.b1": "Open GIS & Satellite Pipeline",
    "home.footer.b2": "Optical + SAR Dual Spectrum",
    "home.footer.b3": "22+ Indic Languages",
    "home.footer.copy": "© 2026 Vyomix · Earth Query Lens. All rights reserved.",
  },
  hi: {
    "app.title": "अर्थ क्वेरी लेंस",
    "app.subtitle": "मल्टीमॉडल भू-स्थानिक AI",
    "nav.chat": "चैट",
    "nav.map": "मानचित्र",
    "nav.newChat": "नई चैट",
    "sidebar.chats": "चैट्स",
    "sidebar.noChats": "कोई पिछली चैट नहीं।",
    "sidebar.deleteChat": "चैट हटाएं",
    "settings.title": "कॉन्फ़िगरेशन",
    "settings.geminiKey": "API कुंजी 1",
    "settings.gradioUrl": "GeoChat Gradio URL",
    "settings.cancel": "रद्द करें",
    "settings.save": "सहेजें",
    "input.placeholder.empty": "अपनी सैटेलाइट इमेजरी के बारे में पूछें...",
    "input.placeholder.followup": "फॉलो-अप प्रश्न पूछें या मानचित्र पर खींचें...",
    "input.formats": "GeoTIFF · TIFF · PNG · JPEG · BigEarth · JP2 · SAR समर्थित",
    "input.attach": "इमेजरी संलग्न करें (बाई-टेम्पोरल के लिए अधिकतम 2)",
    "drop.title": "अपलोड करने के लिए चित्र छोड़ें",
    "drop.subtitle": "TIFF, JPG, और PNG फ़ाइलें समर्थित हैं",
    "map.selectRegion": "क्षेत्र चुनें",
    "map.drawInstruction": "बॉक्स बनाने के लिए क्लिक करें और खींचें।",
    "map.panInstruction": "पैन और ज़ूम करें, या नया क्षेत्र बनाएं।",
    "map.drawArea": "क्षेत्र बनाएं",
    "map.cancelDrawing": "ड्राइंग रद्द करें",
    "map.sendToChat": "चैट पर भेजें",
    "map.capturing": "कैप्चर हो रहा है...",
    "map.useLocation": "लाइव लोकेशन उपयोग करें",
    "map.locating": "लोकेशन प्राप्त कर रहे हैं...",
    "map.locationError": "लोकेशन एक्सेस अस्वीकृत",
    "map.locationHint": "ब्राउज़र GPS एक्सेस के लिए अनुमति मांगेगा",
    "confidence": "विश्वास स्तर",
    "evidence": "साक्ष्य",
    "executionTrace": "निष्पादन ट्रेस",
    "processing": "प्रोसेसिंग...",
    "initializing": "आरंभ हो रहा है...",
    "translating": "अनुवाद हो रहा है...",
    "biTemporal": "बाई-टेम्पोरल मोड",
    "preEvent": "T1: पूर्व-घटना",
    "postEvent": "T2: पश्चात-घटना",
    "changeDetected": "⚠ महत्वपूर्ण परिवर्तन पाया गया",
    "noChange": "✓ कोई महत्वपूर्ण परिवर्तन नहीं",
    "estimatedArea": "अनुमानित प्रभावित क्षेत्र",
    "language": "भाषा",
    "chart.title": "कालक्रम परिवर्तन विश्लेषण",
    "chart.vegetation": "वनस्पति छत्र",
    "chart.urban": "शहरी / निर्मित क्षेत्र",
    "chart.water": "जल निकाय",
    "chart.barren": "अछूता भू-भाग",
    "chart.preEvent": "पूर्व-घटना (T1)",
    "chart.postEvent": "पश्चात-घटना (T2)",
    "chart.bar": "बार चार्ट",
    "chart.spline": "स्प्लाइन वक्र",
    "chart.radar": "रडार ग्राफ",
    "chart.all": "सभी दृश्य",
    "chart.highlighted": "हाइलाइट की गई विशेषताएं",
    "clickToPreview": "देखने के लिए क्लिक करें",
    "map.bitemporalToggle": "बाई-टेम्पोरल टाइमलाइन",
    "map.splitActive": "विभाजित दृश्य सक्रिय",
    "map.t1Baseline": "T1 (आधार रेखा)",
    "map.t2Observation": "T2 (अवलोकन)",
    "map.preset15yr": "15 वर्ष पूर्व",
    "map.preset10yr": "10 वर्ष पूर्व",
    "map.preset5yr": "5 वर्ष पूर्व",
    "map.preset1yr": "1 वर्ष पूर्व",
    "map.sensorModis": "NASA MODIS (2000-अब)",
    "map.sensorViirs": "NASA VIIRS (2012-अब)",
    "map.dragToCompare": "तुलना करने के लिए स्लाइडर खींचें",
    "map.capturingBitemporal": "T1 और T2 कैप्चर हो रहे हैं...",
    "map.sarOpticalToggle": "SAR बनाम ऑप्टिकल दोहरा दृश्य",
    "map.sarOpticalActive": "SAR और ऑप्टिकल दोहरा दृश्य सक्रिय",
    "map.capturingOpticalSar": "ऑप्टिकल और SAR सेंसर कैप्चर हो रहे हैं...",
    "map.benchmarks": "चुनिंदा बेंचमार्क",
    "map.layerOptical": "ऑप्टिकल बैंड (सेंटिनल-2 / हाई-रेज़)",
    "map.layerSar": "SAR रडार (सेंटिनल-1 माइक्रोवेव सी-बैंड)",
    "sarOptical.onnxPipeline": "ब्राउज़र-में ONNX ML पाइपलाइन",
    "sarOptical.opticalTitle": "ऑप्टिकल मल्टी-स्पेक्ट्रल इंडेक्स",
    "sarOptical.sarTitle": "SAR सिंथेटिक एपर्चर रडार",
    "sarOptical.synergyTitle": "क्रॉस-मोडैलिटी सहक्रिया और संलयन अंतर्दृष्टि",
    "telemetry.analyzing": "मल्टी-बैंड समय-परिवर्तन और भू-स्थानिक टेलीमेट्री का अनुमान...",
    "telemetry.passActive": "स्पेक्ट्रल पास सक्रिय",
    "map.bitemporal": "बाई-टेम्पोरल",
    "map.sarOptical": "SAR और ऑप्टिकल",
    "map.bitemporalDesc": "बाएं और दाएं के लिए कोई भी काल चुनें। तुलना के लिए स्लाइडर खींचें।",
    "map.sarOpticalDesc": "ऑप्टिकल और SAR के बीच बादल भेदन और बैकस्कैटर अंतर देखने के लिए स्लाइडर खींचें।",
    "map.captureBitemporal": "दोनों दृश्य स्वतः कैप्चर करें",
    "map.captureSarOptical": "ऑप्टिकल और SAR जोड़ी कैप्चर करें",
    "map.leftOptical": "बायां (ऑप्टिकल)",
    "map.rightSar": "दायां (SAR रडार)",
    "map.leftT1": "बायां दृश्य (T1)",
    "map.rightT2": "दायां दृश्य (T2)",
    "map.dragToComparePrompt": "तुलना के लिए स्लाइडर बाएं / दाएं खींचें",
    "map.opticalMulti": "ऑप्टिकल मल्टीस्पेक्ट्रल",
    "map.sarRadar": "सिंथेटिक एपर्चर रडार (SAR)",
    "map.historicalArchives": "ऐतिहासिक अभिलेखागार",
    "benchmark.assam": "असम बाढ़",
    "benchmark.assamDesc": "बादल भेदन और बाढ़ विस्तार",
    "benchmark.mumbai": "मुंबई तटीय",
    "benchmark.mumbaiDesc": "डबल-बाउंस शहरी रडार",
    "benchmark.kerala": "केरल भूस्खलन",
    "benchmark.keralaDesc": "सतह खुरदरापन और मिट्टी की नमी",
    "benchmark.sundarbans": "सुंदरबन डेल्टा",
    "benchmark.sundarbansDesc": "ज्वारीय चैनल और मैंग्रोव छत्र",
    "voice.listening": "आपकी आवाज़ सुन रहे हैं...",
    "voice.speakPrompt": "प्रॉम्प्ट बोलकर सुनाएं (TTS)",
    "voice.speakResponse": "विश्लेषण बोलकर सुनाएं (TTS)",
    "voice.stopSpeaking": "बोलना बंद करें",

    // ──────────────── TOP BAR & BRAND ────────────────
    "nav.vyomix": "व्योमिक्स",
    "nav.launchStudio": "स्टूडियो खोलें",
    "nav.tagline": "मल्टीमॉडल उपग्रह बुद्धिमत्ता",
    "nav.sih": "SIH 2026",
    "nav.home": "होम",

    // ──────────────── HERO SECTION ────────────────
    "home.hero.badge1": "स्मार्ट इंडिया हैकाथॉन 2026",
    "home.hero.badge2": "मल्टीमॉडल उपग्रह दृष्टि",
    "home.hero.title1": "बादलों के पार देखें।",
    "home.hero.title2": "कक्षीय बुद्धिमत्ता",
    "home.hero.title3": "का संचालन करें।",
    "home.hero.desc": "ऑप्टिकल और सिंथेटिक एपर्चर रडार (SAR) को संयोजित करने वाली अगली पीढ़ी की पृथ्वी अवलोकन बुद्धिमत्ता। 22+ भाषाओं में देशी भारतीय आवाज के साथ जटिल उपग्रह दृश्यों की जांच करें।",
    "home.hero.cta": "अर्थ क्वेरी लेंस शुरू करें",
    
    // Telemetry cards
    "home.hero.telemetry.radar.title": "रडार सेंसर",
    "home.hero.telemetry.radar.val": "C/L/X-बैंड SAR",
    "home.hero.telemetry.radar.desc": "बादल-अपरिवर्तनीय चरण",
    "home.hero.telemetry.res.title": "धरातलीय संकल्प",
    "home.hero.telemetry.res.val": "उप-मीटर परिशुद्धता",
    "home.hero.telemetry.res.desc": "समन्वय बाउंडिंग बॉक्स",
    "home.hero.telemetry.calc.title": "भौतिक मेट्रिक्स",
    "home.hero.telemetry.calc.val": "सटीक क्षेत्रफल (किमी²/मी²)",
    "home.hero.telemetry.calc.desc": "नियतत्य कलन",
    "home.hero.telemetry.voice.title": "भारतीय भाषाई समर्थन",
    "home.hero.telemetry.voice.val": "10+ भाषाएँ",
    "home.hero.telemetry.voice.desc": "मूल STT + TTS आवाज़",

    // ──────────────── SCROLL EXPAND SECTION ────────────────
    "home.scroll.title": "कक्षीय धरातलीय अवलोकन",
    "home.scroll.hint": "कक्षीय दृश्य खोलने के लिए स्क्रॉल करें ↓",
    "home.scroll.badge": "सेंटिनल और भुवन ओपन GIS संगत",
    "home.scroll.h1": "प्रत्येक पिक्सेल का ऑडिट।",
    "home.scroll.h2": "प्रत्येक उपग्रह पास धरातल से जुड़ा।",
    "home.scroll.desc": "हिमनद विज्ञान और हिमनदी झील विस्फोट से लेकर तटीय सुरक्षा और डेल्टा कृषि बेल्ट तक, अर्थ क्वेरी लेंस ऑप्टिकल और रडार पास को शून्य-विलंबता भू-स्थानिक बुद्धिमत्ता में संश्लेषित करता है।",
    "home.scroll.cta": "ऑपरेशनल स्टूडियो में प्रवेश करें",

    // ──────────────── MAGIC BENTO SECTION ────────────────
    "home.bento.badge": "खुफिया क्षमताएं",
    "home.bento.title": "आधुनिक उपग्रह विश्लेषण के लिए निर्मित",
    "home.bento.desc": "भौतिक क्षेत्र मॉडलिंग और मूल बहु-भाषा आवाज श्रुतलेख का उपयोग करके जटिल बहु-सेंसर पृथ्वी अवलोकन दृश्यों के साथ बातचीत करें।",
    "home.bento.c1.title": "दोहरा-स्पेक्ट्रम रडार संलयन",
    "home.bento.c1.desc": "सिंथेटिक एपर्चर रडार (SAR) 24/7 हर मौसम में पृथ्वी निगरानी के लिए मानसूनी बादलों, धुएं और अंधेरे में प्रवेश करता है।",
    "home.bento.c1.label": "ऑप्टिकल + SAR",
    "home.bento.c2.title": "भौतिक भू-क्षेत्र कलन",
    "home.bento.c2.desc": "ग्राउंड सैंपलिंग डिस्टेंस (GSD) से सीधे गणना की गई नियतात्मक मात्रा (+/- किमी², मी², वर्ग फुट)।",
    "home.bento.c2.label": "GSD क्षेत्रफल गणित",
    "home.bento.c3.title": "बहुभाषी भारतीय आवाज इंजन",
    "home.bento.c3.desc": "लाइव ऑडियो रीडआउट के साथ हिंदी, कन्नड़, तमिल, तेलुगु और 10+ भाषाओं में भाषण पहचान के माध्यम से रिमोट सेंसिंग इमेजरी से सवाल करें।",
    "home.bento.c3.label": "10+ भाषाएँ",
    "home.bento.c4.title": "द्वि-कालिक खतरा और परिवर्तन पहचान",
    "home.bento.c4.desc": "बाढ़ जलभराव रेखाओं, वृक्ष आवरण हानि और अनधिकृत निर्माण को स्वचालित रूप से ट्रैक करने के लिए पूर्व और पश्चात के उपग्रह चित्रों की तुलना करें।",
    "home.bento.c4.label": "परिवर्तन पहचान",
    "home.bento.c5.title": "उप-मीटर निर्देशांक ग्राउंडिंग",
    "home.bento.c5.desc": "नौसैनिक जहाजों, रनवे, परिवहन मार्गों और भवन निर्माणों की पहचान करने वाला पिक्सेल-स्तरीय बाउंडिंग बॉक्स स्थानिक स्थानीयकरण।",
    "home.bento.c5.label": "ऑब्जेक्ट डिटेक्शन",
    "home.bento.c6.title": "सार्वभौमिक GeoTIFF और सेंटिनल इनजेशन",
    "home.bento.c6.desc": "GeoTIFF रास्टर, ओपन भू-स्थानिक परतों और सेंटिनल-1/2 उत्पादों के अनुकूल जटिल रिमोट सेंसिंग दृश्यों का निर्बाध विश्लेषण करें।",
    "home.bento.c6.label": "ओपन GIS",

    // ──────────────── WORKFLOWS / CASE STUDIES ────────────────
    "home.wf.badge": "परिचालन प्रभाव कार्यप्रवाह",
    "home.wf.heading": "समुद्री सुरक्षा से लेकर जलवायु लचीलेपन तक",
    "home.wf.c1.tag": "केस स्टडी 01",
    "home.wf.c1.title": "आपदा और बाढ़ त्वरित मानचित्रण",
    "home.wf.c1.desc": "जब घने बादल नदी घाटियों में मानसूनी बाढ़ को छिपाते हैं, तो SAR रडार डेटा अपलोड के 90 सेकंड के भीतर जलभराव का नक्शा बनाता है और जलमग्न सड़कों की पहचान करता है।",
    "home.wf.c1.p1": "जलमग्न परिवहन मार्गों की पहचान",
    "home.wf.c1.p2": "किमी² में तत्काल विस्थापित क्षेत्रफल",
    "home.wf.c2.tag": "केस स्टडी 02",
    "home.wf.c2.title": "तटीय और समुद्री जल निगरानी",
    "home.wf.c2.desc": "तटीय गलियारों और समुद्री क्षेत्रों की निगरानी करें। घने कोहरे में गैर-सहकारी जहाजों का पता लगाएं और रडार लक्ष्यों को नेविगेशन टेलीमेट्री के साथ क्रॉस-रेफरेंस करें।",
    "home.wf.c2.p1": "जहाज लक्ष्य निर्देशांक",
    "home.wf.c2.p2": "रात्रि वेक डिटेक्शन",
    "home.wf.c3.tag": "केस स्टडी 03",
    "home.wf.c3.title": "वन छत्र और भूमि अतिक्रमण ऑडिटिंग",
    "home.wf.c3.desc": "संरक्षित बायोस्फीयर में अवैध कटाई की पहचान करने के लिए पर्यावरण संरक्षण टीमों को सशक्त बनाएं। नियामक कार्रवाई के लिए वर्ग फुट में छत्र हानि की गणना करें।",
    "home.wf.c3.p1": "कैनोपी घनत्व परिवर्तन ट्रैकिंग",
    "home.wf.c3.p2": "स्वचालित फोरेंसिक PDF रिपोर्ट",

    // ──────────────── FINAL SECTION (NON-AI-SLOPPY) ────────────────
    "home.final.tag": "मिशन रेडी · SIH 2026",
    "home.final.title": "बड़े पैमाने पर कक्षीय सत्य को तैनात करें",
    "home.final.desc": "आपदा परिधि मानचित्रण से लेकर नौसैनिक जहाज स्थानीयकरण तक, व्योमिक्स सेकंडों में सत्यापन योग्य, बहु-बैंड उपग्रह प्रमाणीकरण के साथ कमांड सेंटरों को सुसज्जित करता है।",
    "home.final.cta": "व्योमिक्स ऑपरेशनल स्टूडियो लॉन्च करें",

    // ──────────────── FOOTER ────────────────
    "home.footer.brand": "अर्थ क्वेरी लेंस",
    "home.footer.sih": "स्मार्ट इंडिया हैकाथॉन (SIH 2026) पहल",
    "home.footer.b1": "ओपन GIS और सैटेलाइट पाइपलाइन",
    "home.footer.b2": "ऑप्टिकल + SAR ड्यूल स्पेक्ट्रम",
    "home.footer.b3": "22+ भारतीय भाषाएँ",
    "home.footer.copy": "© 2026 व्योमिक्स · अर्थ क्वेरी लेंस। सर्वाधिकार सुरक्षित।",
  },
  kn: {
    "app.title": "ಅರ್ತ್ ಕ್ವೆರಿ ಲೆನ್ಸ್",
    "app.subtitle": "ಮಲ್ಟಿಮೋಡಲ್ ಭೌಗೋಳಿಕ AI",
    "nav.chat": "ಚಾಟ್",
    "nav.map": "ನಕ್ಷೆ",
    "nav.newChat": "ಹೊಸ ಚಾಟ್",
    "sidebar.chats": "ಚಾಟ್‌ಗಳು",
    "sidebar.noChats": "ಹಿಂದಿನ ಚಾಟ್‌ಗಳಿಲ್ಲ.",
    "sidebar.deleteChat": "ಚಾಟ್ ಅಳಿಸಿ",
    "settings.title": "ಸಂರಚನೆ",
    "settings.geminiKey": "API ಕೀ 1",
    "settings.gradioUrl": "GeoChat Gradio URL",
    "settings.cancel": "ರದ್ದುಮಾಡಿ",
    "settings.save": "ಉಳಿಸಿ",
    "input.placeholder.empty": "ನಿಮ್ಮ ಸ್ಯಾಟಲೈಟ್ ಚಿತ್ರಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    "input.placeholder.followup": "ಫಾಲೋ-ಅಪ್ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ ಅಥವಾ ನಕ್ಷೆಗೆ ಎಳೆಯಿರಿ...",
    "input.formats": "GeoTIFF · TIFF · PNG · JPEG · BigEarth · JP2 · SAR ಬೆಂಬಲಿತ",
    "input.attach": "ಚಿತ್ರಗಳನ್ನು ಲಗತ್ತಿಸಿ (ಬೈ-ಟೆಂಪೋರಲ್‌ಗಾಗಿ ಗರಿಷ್ಠ 2)",
    "drop.title": "ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಚಿತ್ರಗಳನ್ನು ಬಿಡಿ",
    "drop.subtitle": "TIFF, JPG, ಮತ್ತು PNG ಫೈಲ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ",
    "map.selectRegion": "ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ",
    "map.drawInstruction": "ಬಾಕ್ಸ್ ಎಳೆಯಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಮತ್ತು ಎಳೆಯಿರಿ.",
    "map.panInstruction": "ಪ್ಯಾನ್ ಮತ್ತು ಜೂಮ್ ಮಾಡಿ, ಅಥವಾ ಹೊಸ ಪ್ರದೇಶ ಎಳೆಯಿರಿ.",
    "map.drawArea": "ಪ್ರದೇಶ ಎಳೆಯಿರಿ",
    "map.cancelDrawing": "ಡ್ರಾಯಿಂಗ್ ರದ್ದುಮಾಡಿ",
    "map.sendToChat": "ಚಾಟ್‌ಗೆ ಕಳುಹಿಸಿ",
    "map.capturing": "ಕ್ಯಾಪ್ಚರ್ ಆಗುತ್ತಿದೆ...",
    "map.useLocation": "ಲೈವ್ ಲೊಕೇಶನ್ ಬಳಸಿ",
    "map.locating": "ಸ್ಥಳ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
    "map.locationError": "ಸ್ಥಳ ಪ್ರವೇಶ ನಿರಾಕರಿಸಲಾಗಿದೆ",
    "map.locationHint": "ಬ್ರೌಸರ್ GPS ಪ್ರವೇಶಕ್ಕಾಗಿ ಅನುಮತಿ ಕೇಳುತ್ತದೆ",
    "confidence": "ವಿಶ್ವಾಸ",
    "evidence": "ಸಾಕ್ಷ್ಯ",
    "executionTrace": "ಎಕ್ಸಿಕ್ಯೂಶನ್ ಟ್ರೇಸ್",
    "processing": "ಪ್ರಕ್ರಿಯೆ ಆಗುತ್ತಿದೆ...",
    "initializing": "ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...",
    "translating": "ಅನುವಾದ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    "biTemporal": "ಬೈ-ಟೆಂಪೋರಲ್ ಮೋಡ್",
    "preEvent": "T1: ಪೂರ್ವ-ಘಟನೆ",
    "postEvent": "T2: ನಂತರದ-ಘಟನೆ",
    "changeDetected": "⚠ ಗಮನಾರ್ಹ ಬದಲಾವಣೆ ಪತ್ತೆಯಾಗಿದೆ",
    "noChange": "✓ ಯಾವುದೇ ಗಮನಾರ್ಹ ಬದಲಾವಣೆ ಇಲ್ಲ",
    "estimatedArea": "ಅಂದಾಜು ಪ್ರಭಾವಿತ ಪ್ರದೇಶ",
    "language": "ಭಾಷೆ",
    "chart.title": "ಕಾಲಾನುಕ್ರಮ ಬದಲಾವಣೆ ವಿಶ್ಲೇಷಣೆ",
    "chart.vegetation": "ಸಸ್ಯವರ್ಗದ ಮೇಲಾವರಣ",
    "chart.urban": "ನಗರ / ನಿರ್ಮಿತ ಪ್ರದೇಶ",
    "chart.water": "ಜಲ ಮೂಲಗಳು",
    "chart.barren": "ಅಬಾಧಿತ ಭೂಪ್ರದೇಶ",
    "chart.preEvent": "ಪೂರ್ವ-ಘಟನೆ (T1)",
    "chart.postEvent": "ನಂತರದ-ಘಟನೆ (T2)",
    "chart.bar": "ಬಾರ್ ಚಾರ್ಟ್",
    "chart.spline": "ಸ್ಪ್ಲೈನ್ ಕರ್ವ್",
    "chart.radar": "ರಾಡಾರ್ ಗ್ರಾಫ್",
    "chart.all": "ಎಲ್ಲಾ ವೀಕ್ಷಣೆಗಳು",
    "chart.highlighted": "ಮುಖ್ಯಾಂಶಗೊಳಿಸಿದ ವೈಶಿಷ್ಟ್ಯಗಳು",
    "clickToPreview": "ಪೂರ್ವವೀಕ್ಷಣೆಗೆ ಕ್ಲಿಕ್ ಮಾಡಿ",
    "map.bitemporalToggle": "ಬೈ-ಟೆಂಪೋರಲ್ ಟೈಮ್‌ಲೈನ್",
    "map.splitActive": "ಸ್ಪ್ಲಿಟ್ ವೀಕ್ಷಣೆ ಸಕ್ರಿಯ",
    "map.t1Baseline": "T1 (ಮೂಲ ರೇಖೆ)",
    "map.t2Observation": "T2 (ಅವಲೋಕನ)",
    "map.preset15yr": "15 ವರ್ಷಗಳ ಹಿಂದೆ",
    "map.preset10yr": "10 ವರ್ಷಗಳ ಹಿಂದೆ",
    "map.preset5yr": "5 ವರ್ಷಗಳ ಹಿಂದೆ",
    "map.preset1yr": "1 ವರ್ಷ ಹಿಂದೆ",
    "map.sensorModis": "NASA MODIS (2000-ಈಗ)",
    "map.sensorViirs": "NASA VIIRS (2012-ಈಗ)",
    "map.dragToCompare": "ಹೋಲಿಸಲು ಸ್ಲೈಡರ್ ಎಳೆಯಿರಿ",
    "map.capturingBitemporal": "T1 ಮತ್ತು T2 ಕ್ಯಾಪ್ಚರ್ ಆಗುತ್ತಿವೆ...",
    "map.sarOpticalToggle": "SAR ವಿರುದ್ಧ ಆಪ್ಟಿಕಲ್ ದ್ವಿಮುಖ ವೀಕ್ಷಣೆ",
    "map.sarOpticalActive": "SAR ಮತ್ತು ಆಪ್ಟಿಕಲ್ ದ್ವಿಮುಖ ವೀಕ್ಷಣೆ ಸಕ್ರಿಯ",
    "map.capturingOpticalSar": "ಆಪ್ಟಿಕಲ್ ಮತ್ತು SAR ಸೆನ್ಸರ್‌ಗಳನ್ನು ಸೆರೆಹಿಡಿಯಲಾಗುತ್ತಿದೆ...",
    "map.benchmarks": "ಆಯ್ದ ಬೆಂಚ್‌ಮಾರ್ಕ್‌ಗಳು",
    "map.layerOptical": "ಆಪ್ಟಿಕಲ್ ಬ್ಯಾಂಡ್ (ಸೆಂಟಿನೆಲ್-2 / ಹೈ-ರೆಸ್)",
    "map.layerSar": "SAR ರಾಡಾರ್ (ಸೆಂಟಿನೆಲ್-1 ಮೈಕ್ರೋವೇವ್ ಸಿ-ಬ್ಯಾಂಡ್)",
    "sarOptical.onnxPipeline": "ಬ್ರೌಸರ್‌ನಲ್ಲಿ ONNX ML ಪೈಪ್‌ಲೈನ್",
    "sarOptical.opticalTitle": "ಆಪ್ಟಿಕಲ್ ಮಲ್ಟಿ-ಸ್ಪೆಕ್ಟ್ರಲ್ ಸೂಚ್ಯಂಕಗಳು",
    "sarOptical.sarTitle": "SAR ಸಿಂಥೆಟಿಕ್ ಅಪರ್ಚರ್ ರಾಡಾರ್",
    "sarOptical.synergyTitle": "ಕ್ರಾಸ್-ಮೊಡಾಲಿಟಿ ಸಿನರ್ಜಿ ಮತ್ತು ಒಳನೋಟಗಳು",
    "telemetry.analyzing": "ಮಲ್ಟಿ-ಬ್ಯಾಂಡ್ ಸಮಯ ಬದಲಾವಣೆ ಮತ್ತು ಭೂ-ಸ್ಥಳೀಯ ಟೆಲಿಮೆಟ್ರಿ ಊಹೆ...",
    "telemetry.passActive": "ಸ್ಪೆಕ್ಟ್ರಲ್ ಪಾಸ್ ಸಕ್ರಿಯ",
    "map.bitemporal": "ಬೈ-ಟೆಂಪೋರಲ್",
    "map.sarOptical": "SAR ಮತ್ತು ಆಪ್ಟಿಕಲ್",
    "map.bitemporalDesc": "ಎಡ ಮತ್ತು ಬಲಕ್ಕೆ ಯಾವುದೇ ಯುಗವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ಹೋಲಿಸಲು ಸ್ಲೈಡರ್ ಎಳೆಯಿರಿ.",
    "map.sarOpticalDesc": "ಮೋಡ ಭೇದನ ಮತ್ತು ಬ್ಯಾಕ್‌ಸ್ಕ್ಯಾಟರ್ ವ್ಯತ್ಯಾಸಗಳನ್ನು ವೀಕ್ಷಿಸಲು ಸ್ಲೈಡರ್ ಎಳೆಯಿರಿ.",
    "map.captureBitemporal": "ಎರಡೂ ವೀಕ್ಷಣೆಗಳನ್ನು ಸ್ವಯಂ ಸೆರೆಹಿಡಿಯಿರಿ",
    "map.captureSarOptical": "ಆಪ್ಟಿಕಲ್ ಮತ್ತು SAR ಜೋಡಿಯನ್ನು ಸೆರೆಹಿಡಿಯಿರಿ",
    "map.leftOptical": "ಎಡ (ಆಪ್ಟಿಕಲ್)",
    "map.rightSar": "ಬಲ (SAR ರಾಡಾರ್)",
    "map.leftT1": "ಎಡ ವೀಕ್ಷಣೆ (T1)",
    "map.rightT2": "ಬಲ ವೀಕ್ಷಣೆ (T2)",
    "map.dragToComparePrompt": "ಹೋಲಿಸಲು ಸ್ಲೈಡರ್ ಎಡ / ಬಲಕ್ಕೆ ಎಳೆಯಿರಿ",
    "map.opticalMulti": "ಆಪ್ಟಿಕಲ್ ಮಲ್ಟಿಸ್ಪೆಕ್ಟ್ರಲ್",
    "map.sarRadar": "ಸಿಂಥೆಟಿಕ್ ಅಪರ್ಚರ್ ರಾಡಾರ್ (SAR)",
    "map.historicalArchives": "ಐತಿಹಾಸಿಕ ದಾಖಲೆಗಳು",
    "benchmark.assam": "ಅಸ್ಸಾಂ ಪ್ರವಾಹ",
    "benchmark.assamDesc": "ಮೋಡ ಭೇದನ ಮತ್ತು ಪ್ರವಾಹ ವ್ಯಾಪ್ತಿ",
    "benchmark.mumbai": "ಮುಂಬೈ ಕರಾವಳಿ",
    "benchmark.mumbaiDesc": "ಡಬಲ್-ಬೌನ್ಸ್ ನಗರ ರಾಡಾರ್",
    "benchmark.kerala": "ಕೇರಳ ಭೂಕುಸಿತ",
    "benchmark.keralaDesc": "ಮೇಲ್ಮೈ ಒರಟುತನ ಮತ್ತು ಮಣ್ಣಿನ ತೇವಾಂಶ",
    "benchmark.sundarbans": "ಸುಂದರಬನ್ಸ್ ಡೆಲ್ಟಾ",
    "benchmark.sundarbansDesc": "ಉಬ್ಬರವಿಳಿತ ಚಾನಲ್‌ಗಳು ಮತ್ತು ಮ್ಯಾಂಗ್ರೋವ್ ಮೇಲಾವರಣ",
    "voice.listening": "ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸಲಾಗುತ್ತಿದೆ...",
    "voice.speakPrompt": "ಪ್ರಾಂಪ್ಟ್ ಅನ್ನು ಗಟ್ಟಿಯಾಗಿ ಓದಿ (TTS)",
    "voice.speakResponse": "ವಿಶ್ಲೇಷಣೆಯನ್ನು ಗಟ್ಟಿಯಾಗಿ ಓದಿ (TTS)",
    "voice.stopSpeaking": "ಮಾತನಾಡುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
  },
};

// Greetings per language
export const SPACE_GREETINGS: Partial<Record<Language, string[]>> = {
  en: [
    "Houston, we have a query.",
    "Scanning the cosmos for answers.",
    "Orbital view engaged.",
    "Launching satellite uplink.",
    "Coordinates locked. Ready for analysis.",
    "Ground control to Major Tom.",
    "Entering geospatial orbit.",
    "Mission control standing by.",
    "Telescope aligned. Awaiting target.",
    "Star maps loaded. What do you seek?",
    "Engaging deep space scanners.",
    "Initiating satellite handshake.",
    "Altitude nominal. Awaiting directive.",
    "Quantum uplink established.",
    "The cosmos awaits your query.",
  ],
  hi: [
    "ह्यूस्टन, हमारे पास एक प्रश्न है।",
    "ब्रह्मांड में उत्तर खोज रहे हैं।",
    "कक्षीय दृश्य सक्रिय है।",
    "उपग्रह अपलिंक शुरू हो रहा है।",
    "निर्देशांक लॉक हैं। विश्लेषण के लिए तैयार।",
    "ग्राउंड कंट्रोल से मेजर टॉम।",
    "भू-स्थानिक कक्षा में प्रवेश।",
    "मिशन कंट्रोल तैयार है।",
    "दूरबीन संरेखित। लक्ष्य की प्रतीक्षा में।",
    "तारा मानचित्र लोड हुए। आप क्या खोज रहे हैं?",
    "गहन अंतरिक्ष स्कैनर सक्रिय हैं।",
    "उपग्रह संपर्क स्थापित हो रहा है।",
    "ऊंचाई सामान्य है। निर्देश की प्रतीक्षा है।",
    "क्वांटम अपलिंक स्थापित।",
    "ब्रह्मांड आपके प्रश्न की प्रतीक्षा में है।",
  ],
  kn: [
    "ಹ್ಯೂಸ್ಟನ್, ನಮ್ಮ ಬಳಿ ಒಂದು ಪ್ರಶ್ನೆ ಇದೆ.",
    "ಉತ್ತರಗಳಿಗಾಗಿ ಬ್ರಹ್ಮಾಂಡವನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲಾಗುತ್ತಿದೆ.",
    "ಕಕ್ಷೆಯ ದೃಶ್ಯ ಸಕ್ರಿಯವಾಗಿದೆ.",
    "ಉಪಗ್ರಹ ಅಪ್‌ಲಿಂಕ್ ಪ್ರಾರಂಭವಾಗಿದೆ.",
    "ನಿರ್ದೇಶಾಂಕಗಳು ಲಾಕ್. ವಿಶ್ಲೇಷಣೆಗೆ ಸಿದ್ಧ.",
    "ಗ್ರೌಂಡ್ ಕಂಟ್ರೋಲ್ ನಿಂದ ಮೇಜರ್ ಟಾಮ್.",
    "ಭೌಗೋಳಿಕ ಕಕ್ಷೆಯನ್ನು ಪ್ರವೇಶಿಸಲಾಗುತ್ತಿದೆ.",
    "ಮಿಷನ್ ಕಂಟ್ರೋಲ್ ಸಿದ್ಧವಾಗಿದೆ.",
    "ದೂರದರ್ಶಕ ಜೋಡಿಸಲಾಗಿದೆ. ಗುರಿಗಾಗಿ ಕಾಯುತ್ತಿದೆ.",
    "ನಕ್ಷತ್ರ ನಕ್ಷೆಗಳು ಲೋಡ್ ಆಗಿವೆ. ನೀವೇನು ಹುಡುಕುತ್ತಿದ್ದೀರಿ?",
    "ಡೀಪ್ ಸ್ಪೇಸ್ ಸ್ಕ್ಯಾನರ್‌ಗಳು ಸಕ್ರಿಯವಾಗಿವೆ.",
    "ಉಪಗ್ರಹ ಸಂಪರ್ಕ ಪ್ರಾರಂಭವಾಗಿದೆ.",
    "ಎತ್ತರ ಸಾಮಾನ್ಯವಾಗಿದೆ. ನಿರ್ದೇಶನಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದೆ.",
    "ಕ್ವಾಂಟಮ್ ಸಂಪರ್ಕ ಸ್ಥಾಪಿಸಲಾಗಿದೆ.",
    "ಬ್ರಹ್ಮಾಂಡ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗಾಗಿ ಕಾಯುತ್ತಿದೆ.",
  ],
};

// Suggestion prompts per language
export const ALL_SUGGESTIONS: Partial<Record<Language, { q: string; icon: string }[]>> = {
  en: [
    { q: "Describe this terrain from orbit", icon: "🛰️" },
    { q: "Detect water bodies in this region", icon: "🌊" },
    { q: "What changed between these images?", icon: "🔄" },
    { q: "Identify urban sprawl patterns", icon: "🏙️" },
    { q: "Analyze vegetation density", icon: "🌿" },
    { q: "Map the coastline erosion", icon: "🏖️" },
    { q: "Detect cloud cover percentage", icon: "☁️" },
    { q: "Find agricultural field boundaries", icon: "🌾" },
    { q: "Assess flood damage in this area", icon: "🌧️" },
    { q: "Track deforestation patterns", icon: "🌲" },
    { q: "Identify solar farm installations", icon: "☀️" },
    { q: "Detect road network changes", icon: "🛤️" },
    { q: "Map glacier retreat over time", icon: "🧊" },
    { q: "Analyze night light distribution", icon: "🌃" },
    { q: "Identify ship traffic patterns", icon: "🚢" },
    { q: "Assess wildfire burn severity", icon: "🔥" },
  ],
  hi: [
    { q: "इस भू-भाग का कक्षा से वर्णन करें", icon: "🛰️" },
    { q: "इस क्षेत्र में जल निकाय खोजें", icon: "🌊" },
    { q: "इन चित्रों के बीच क्या बदला?", icon: "🔄" },
    { q: "शहरी विस्तार पैटर्न पहचानें", icon: "🏙️" },
    { q: "वनस्पति घनत्व का विश्लेषण करें", icon: "🌿" },
    { q: "तटरेखा कटाव का मानचित्र बनाएं", icon: "🏖️" },
    { q: "बादल आवरण प्रतिशत पता लगाएं", icon: "☁️" },
    { q: "कृषि क्षेत्र की सीमाएं खोजें", icon: "🌾" },
    { q: "इस क्षेत्र में बाढ़ क्षति का आकलन करें", icon: "🌧️" },
    { q: "वनों की कटाई के पैटर्न का पता लगाएं", icon: "🌲" },
    { q: "सौर फार्म स्थापनाओं की पहचान करें", icon: "☀️" },
    { q: "सड़क नेटवर्क परिवर्तन खोजें", icon: "🛤️" },
    { q: "हिमनद पीछे हटने का मानचित्र बनाएं", icon: "🧊" },
    { q: "रात की रोशनी वितरण का विश्लेषण करें", icon: "🌃" },
    { q: "जहाज यातायात पैटर्न पहचानें", icon: "🚢" },
    { q: "जंगल की आग की गंभीरता का आकलन करें", icon: "🔥" },
  ],
  kn: [
    { q: "ಈ ಭೂಪ್ರದೇಶವನ್ನು ಕಕ್ಷೆಯಿಂದ ವಿವರಿಸಿ", icon: "🛰️" },
    { q: "ಈ ಪ್ರದೇಶದಲ್ಲಿ ಜಲ ಮೂಲಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ", icon: "🌊" },
    { q: "ಈ ಚಿತ್ರಗಳ ನಡುವೆ ಏನು ಬದಲಾಯಿತು?", icon: "🔄" },
    { q: "ನಗರ ವಿಸ್ತರಣೆ ಮಾದರಿಗಳನ್ನು ಗುರುತಿಸಿ", icon: "🏙️" },
    { q: "ಸಸ್ಯವರ್ಗ ಸಾಂದ್ರತೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ", icon: "🌿" },
    { q: "ಕರಾವಳಿ ಸವೆತದ ನಕ್ಷೆ ಮಾಡಿ", icon: "🏖️" },
    { q: "ಮೋಡ ಹೊದಿಕೆ ಶೇಕಡಾವಾರು ಪತ್ತೆ ಮಾಡಿ", icon: "☁️" },
    { q: "ಕೃಷಿ ಕ್ಷೇತ್ರ ಗಡಿಗಳನ್ನು ಹುಡುಕಿ", icon: "🌾" },
    { q: "ಈ ಪ್ರದೇಶದಲ್ಲಿ ಪ್ರವಾಹ ಹಾನಿಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ", icon: "🌧️" },
    { q: "ಅರಣ್ಯ ನಾಶದ ಮಾದರಿಗಳನ್ನು ಪತ್ತೆ ಮಾಡಿ", icon: "🌲" },
    { q: "ಸೌರ ಫಾರ್ಮ್ ಸ್ಥಾಪನೆಗಳನ್ನು ಗುರುತಿಸಿ", icon: "☀️" },
    { q: "ರಸ್ತೆ ಜಾಲ ಬದಲಾವಣೆಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ", icon: "🛤️" },
    { q: "ಹಿಮನದಿ ಹಿಮ್ಮೆಟ್ಟುವಿಕೆಯ ನಕ್ಷೆ ಮಾಡಿ", icon: "🧊" },
    { q: "ರಾತ್ರಿ ಬೆಳಕಿನ ವಿತರಣೆಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ", icon: "🌃" },
    { q: "ಹಡಗು ಸಂಚಾರ ಮಾದರಿಗಳನ್ನು ಗುರುತಿಸಿ", icon: "🚢" },
    { q: "ಕಾಡ್ಗಿಚ್ಚಿನ ತೀವ್ರತೆಯನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ", icon: "🔥" },
  ],
};

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string) => Promise<string>;
  isTranslatingUI: boolean;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  translateDynamic: async (text: string) => text,
  isTranslatingUI: false,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("satquery.lang") as Language;
      if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
    }
    return "en";
  });

  const inFlight = React.useRef<Set<string>>(new Set());

  const [dynamicDicts, setDynamicDicts] = useState<Record<string, Record<string, string>>>(() => {
    if (typeof window === "undefined") return {};
    const initial: Record<string, Record<string, string>> = {};
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("satquery.ui_dict_") && !k.startsWith("satquery.ui_dict_v5_")) {
          keysToRemove.push(k);
        } else if (k && k.startsWith("satquery.ui_dict_v5_")) {
          const langCode = k.replace("satquery.ui_dict_v5_", "");
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            const isCorrupt = Object.values(parsed).some(
              (v) => typeof v === "string" && (v.includes("||") || v.includes("|||"))
            );
            if (!isCorrupt && typeof parsed === "object") {
              initial[langCode] = parsed;
            } else {
              keysToRemove.push(k);
            }
          }
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (_) {}
    return initial;
  });

  const [isTranslatingUI, setIsTranslatingUI] = useState(false);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("satquery.lang", newLang);
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
      document.documentElement.setAttribute("data-lang", lang);
    }

    if (lang === "en") return;

    const source = { ...(translations["en"] || {}) };
    const totalKeys = Object.keys(source).length;
    const existingDynamic = dynamicDicts[lang];
    const existingStatic = translations[lang];

    const hasCompleteKeys = existingDynamic && Object.keys(existingDynamic).length >= totalKeys * 0.9;
    if (hasCompleteKeys) return;

    let cancelled = false;
    setIsTranslatingUI(true);

    batchTranslateUI(source, lang)
      .then((translated) => {
        if (!cancelled && translated && Object.keys(translated).length > 0) {
          setDynamicDicts((prev) => ({
            ...prev,
            [lang]: { ...(existingStatic || {}), ...(prev[lang] || {}), ...translated }
          }));
        }
      })
      .catch((err) => {
        console.warn(`[i18n] Dynamic translation error for ${lang}:`, err);
      })
      .finally(() => {
        if (!cancelled) setIsTranslatingUI(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lang]);

  const t = (key: string, fallback?: string): string => {
    if (lang === "en") {
      return translations["en"]?.[key] || fallback || key;
    }

    const found = dynamicDicts[lang]?.[key] || translations[lang]?.[key];
    if (found) return found;

    const enText = translations["en"]?.[key] || fallback || key;

    // Auto-fetch missing translation on the fly
    const flightKey = `${lang}:${key}`;
    if (typeof window !== "undefined" && !inFlight.current.has(flightKey) && enText && enText.trim()) {
      inFlight.current.add(flightKey);
      translateViaGoogleGTX(enText, lang, "en")
        .then((tr) => {
          if (tr && tr.trim() && tr !== enText) {
            setDynamicDicts((prev) => {
              const cur = prev[lang] || {};
              const next = { ...cur, [key]: tr.trim() };
              try {
                localStorage.setItem(`satquery.ui_dict_v5_${lang}`, JSON.stringify(next));
              } catch (_) {}
              return { ...prev, [lang]: next };
            });
          }
        })
        .catch(() => {})
        .finally(() => {
          inFlight.current.delete(flightKey);
        });
    }

    return enText;
  };

  const translateDynamic = async (text: string): Promise<string> => {
    if (!text || lang === "en") return text;
    return translateViaGoogleGTX(text, lang, "en");
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t, translateDynamic, isTranslatingUI }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}


