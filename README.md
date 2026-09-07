<div align="center">
  <img src="https://raw.githubusercontent.com/shreyas/earth-query-lens/main/public/logo.svg" onerror="this.src='https://img.icons8.com/color/144/satellite-in-orbit.png'" alt="Earth Query Lens Logo" width="120" />

  # 🌍 Earth Query Lens
  **Multimodal Satellite Imagery Analysis AI**

  [![React](https://img.shields.io/badge/React-19-blue.svg?style=flat&logo=react)](#)
  [![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg?style=flat&logo=vite)](#)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind-4.2-38B2AC.svg?style=flat&logo=tailwind-css)](#)
  [![Vercel Ready](https://img.shields.io/badge/Vercel-Deploy-black.svg?style=flat&logo=vercel)](#)

  <br />

  <!-- Animated Typing SVG -->
  <a href="#">
    <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=22&duration=3000&pause=1000&color=38BDF8&center=true&vCenter=true&width=600&lines=Analyze+optical+and+SAR+satellite+imagery;Detect+bi-temporal+changes+instantly;Orchestrate+multi-agent+evidence+fusion;Client-side+Gemini+Vision+Integration" alt="Typing SVG" />
  </a>

</div>

---

## ✨ Features

Earth Query Lens is a fully client-side conversational AI interface for analyzing satellite imagery using direct integration with large multimodal models.

- 🛰 **Multi-Format Support:** Directly upload GeoTIFF, TIFF, SAR, BigEarth, PNG, and JPEG imagery.
- 💬 **Conversational Interface:** A sleek, scrolling ChatGPT-style UI with a persistent bottom input bar.
- 🔄 **Bi-Temporal Change Detection:** Upload two images (Pre and Post event) to instantly trigger a specialized evidence fusion workflow.
- 🎨 **Bounding Box Overlays:** Water bodies, urban areas, and other detected features are dynamically rendered via HTML5 `<canvas>` overlays.
- ⚡ **Zero-Backend Architecture:** Bypasses traditional Python backends by executing logic and multimodal prompts directly in the browser.

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/earth-query-lens.git
   cd earth-query-lens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=AIzaSy_YOUR_KEY_HERE
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

## 📐 Architecture

<div align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/React-Dark.svg" height="40" alt="React" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Vite-Dark.svg" height="40" alt="Vite" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TailwindCSS-Dark.svg" height="40" alt="Tailwind" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/TypeScript.svg" height="40" alt="TypeScript" />
</div>

- **Framework:** React + Vite + TanStack Router (TanStack Start)
- **Styling:** Tailwind CSS v4 + Radix UI
- **Geospatial Processing:** `geotiff.js` for in-browser client-side `.tif` conversion
- **LLM Engine:** Direct `fetch` requests to Gemini API (`gemini-3.6-flash`) for instantaneous zero-server processing.

## 📦 Deployment (Vercel)

This project is optimized for Vercel with zero-configuration needed. 
1. Push this repository to GitHub.
2. Import the project in Vercel.
3. Vercel will automatically detect the build settings (using the `vercel` preset configured in Vite).
4. Add `VITE_GEMINI_API_KEY` to Vercel Environment Variables.
5. Deploy!
