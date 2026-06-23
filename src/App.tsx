import React, { useState, useEffect } from "react";
import NatureNavbar from "./components/NatureNavbar";
import DisasterCard from "./components/DisasterCard";
import DisasterSimulator from "./components/DisasterSimulator";
import FeedbackSection from "./components/FeedbackSection";
import Helmet from "./components/Helmet";
import { AboutView, PrivacyView, ContactView } from "./components/AboutPrivacyContactViews";
import { DISASTER_PROFILES } from "./data";
import { DisasterProfile } from "./types";
import { Sparkles, Compass, HelpCircle, Shield, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { apiFetch } from "./utils/api";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "about" | "privacy" | "contact">(() => {
    if (typeof window !== "undefined") {
      try {
        const path = window.location.pathname;
        if (path === "/about") return "about";
        if (path === "/privacy") return "privacy";
        if (path === "/contact") return "contact";
      } catch (e) {
        console.warn("Pathname check restricted by sandbox. Falling back to home view.", e);
      }
    }
    return "home";
  });
  const [activeDisaster, setActiveDisaster] = useState<DisasterProfile | null>(null);

  // Dynamic layout texts fetched from backend configuration store
  const [heroTitle, setHeroTitle] = useState<string>("Nature's Destructive Phases");
  const [heroDescription, setHeroDescription] = useState<string>(
    "Operate dynamic 10-second AI-powered simulations of Earth's extreme geophysical transformations. Toggle visual styles directly from our research vectors between clean schematic representations and high-fidelity volumetric particle systems."
  );

  // Responsive Carousel Sizing & Index Management
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [visibleItems, setVisibleItems] = useState(3);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(2);
      } else {
        setVisibleItems(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalItems = DISASTER_PROFILES.length;
  const maxIndex = Math.max(0, totalItems - visibleItems);

  // Keep carouselIndex in bounds on resize
  useEffect(() => {
    if (carouselIndex > maxIndex) {
      setCarouselIndex(maxIndex);
    }
  }, [visibleItems, maxIndex]);

  const handlePrev = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCarouselIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setTouchStart(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.clientX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    setTouchStart(null);
  };

  const handleMouseLeave = () => {
    setTouchStart(null);
  };

  // Handle Dynamic Editorial Configuration & Page View Tracking
  useEffect(() => {
    // Fetch live configurations to display homepage edits instantly
    const loadConfig = async () => {
      try {
        const res = await apiFetch("/api/config");
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          const data = await res.json();
          if (data.status === "success" && data.data) {
            if (data.data.heroTitle) setHeroTitle(data.data.heroTitle);
            if (data.data.heroDescription) setHeroDescription(data.data.heroDescription);
          }
        } else {
          console.log("Using default configuration (server layout config endpoints are inactive).");
        }
      } catch (err) {
        console.warn("Could not connect to layout config store, using default content parameters.", err);
      }
    };
    loadConfig();

    // Fire anonymous telemetry view load hit
    const trackHit = async () => {
      try {
        const res = await apiFetch("/api/analytics/track", { method: "POST" });
        if (!res.ok) {
          // quiet fail
        }
      } catch (err) {
        // quiet fail
      }
    };
    trackHit();
  }, [currentView]);

  // Support full back/forward browser history navigation for isolated routes
  useEffect(() => {
    const handlePopState = () => {
      let path = "";
      try {
        path = typeof window !== "undefined" ? window.location.pathname : "";
      } catch (e) {
        console.warn("Could not read location.pathname in popstate pop. Restricting navigation side effects.", e);
      }

      if (path === "/about") {
        setCurrentView("about");
        setActiveDisaster(null);
      } else if (path === "/privacy") {
        setCurrentView("privacy");
        setActiveDisaster(null);
      } else if (path === "/contact") {
        setCurrentView("contact");
        setActiveDisaster(null);
      } else {
        setCurrentView("home");
        setActiveDisaster(null);
      }
    };
    if (typeof window !== "undefined") {
      try {
        window.addEventListener("popstate", handlePopState);
      } catch (e) {
        console.warn("Failed to attach popstate event listener:", e);
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        try {
          window.removeEventListener("popstate", handlePopState);
        } catch (e) {
          console.warn("Failed to remove popstate event listener:", e);
        }
      }
    };
  }, []);

  // Router dispatcher
  const handleNavigate = (view: "home" | "about" | "privacy" | "contact") => {
    setCurrentView(view);
    setActiveDisaster(null); // return to home when clicking navbar
    try {
      window.history.pushState(null, "", view === "home" ? "/" : `/${view}`);
    } catch (e) {
      console.warn("history.pushState restricted by iframe sandbox context. Continuing navigation locally.", e);
    }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.warn("window.scrollTo restricted by sandbox layout:", e);
    }
  };

  const handleSelectDisaster = (profile: DisasterProfile) => {
    setActiveDisaster(profile);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.warn("window.scrollTo restricted by sandbox layout:", e);
    }
  };

  const handleReturnHome = () => {
    setActiveDisaster(null);
    setCurrentView("home");
    try {
      window.history.pushState(null, "", "/");
    } catch (e) {
      console.warn("history.pushState restricted by iframe sandbox context. Continuing navigation locally.", e);
    }
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      console.warn("window.scrollTo restricted by sandbox layout:", e);
    }
  };

  // Dynamic SEO metadata dispatcher for optimal search indexing & AdSense compatibility
  const getHelmetMeta = () => {
    if (activeDisaster) {
      return {
        title: `${activeDisaster.title} Core Simulation Lab | Nature's Rage`,
        description: `Simulate high-fidelity physical models of ${activeDisaster.title.toLowerCase()}. ${activeDisaster.shortDescription} Analyze seismological patterns, wind currents, climate forecasts, and direct protective guidance.`
      };
    }
    switch (currentView) {
      case "about":
        return {
          title: "About Advanced Geological Simulation Hub | Nature's Rage",
          description: "Meet Nature's Rage, the premier design portal dedicated to scientific 10-second simulations of complex geophysical transformations and extreme natural disaster events."
        };
      case "privacy":
        return {
          title: "Privacy Shield & Security Parameters | Nature's Rage",
          description: "Explore the security guidelines, data protection protocols, and cookie optimization policies guiding scientific telemetry validation at Nature's Rage."
        };
      case "contact":
         return {
          title: "Establish Institutional Contact | Nature's Rage Portal",
          description: "Connect with our design division, clear executive compliance checks, or file scientific comments regarding geological/meteorological modeling frameworks."
        };
      case "home":
      default:
        return {
          title: "Nature's Rage Portal - Advanced 10-Second Planetary Natural Disaster Simulators",
          description: "Operate high-fidelity AI-powered physical simulations of major Earth transformations including Volcano Eruptions, Tsunamis, Earthquakes, Cyclones, and more."
        };
    }
  };

  const { title: pageTitle, description: pageDescription } = getHelmetMeta();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic SEO / AdSense Metadata Helmet */}
      <Helmet title={pageTitle} description={pageDescription} />
      {/* Shared Global Top Navbar Brand */}
      <NatureNavbar 
        currentView={activeDisaster ? "simulator" : currentView} 
        onNavigate={handleNavigate} 
      />

      {/* Main Container */}
      <main className="flex-grow">
        {activeDisaster ? (
          /* Separate Disaster lab view */
          <DisasterSimulator 
            profile={activeDisaster} 
            onBack={handleReturnHome} 
          />
        ) : (
          /* Traditional SPA routing views */
          <>
            {currentView === "home" && (
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-12 animate-fade-in">
                
                {/* 1. Top Section: Hero Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-slate-900/10 border border-slate-900/70 p-6 md:p-8 rounded-3xl">
                  
                  {/* Left Column: Info panel with Title & Description */}
                  <div className="lg:col-span-7 space-y-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-full uppercase tracking-widest font-mono select-none">
                        <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
                        Continuous Planetary Core Telemetry
                      </div>

                      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight select-text">
                        {heroTitle}
                      </h1>

                      <p className="text-slate-400 text-sm md:text-base leading-relaxed select-text max-w-2xl">
                        {heroDescription}
                      </p>
                    </div>

                    <div className="pt-5 border-t border-slate-900/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-900/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>📡 Seismological</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-900/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span>🌋 Volcanic</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-900/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span>🌊 Hydrological</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/40 px-3 py-2 rounded-lg border border-slate-900/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>🌪️ Climatological</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Telemetry details */}
                  <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/40 border border-slate-900 rounded-2xl p-5 md:p-6 space-y-4">
                    <div>
                      <h3 className="text-xs font-mono uppercase tracking-widest text-emerald-400 mb-2 font-bold select-none">
                        Core Telemetry status
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Regional seismic sensors, oceanic tide trackers, and supersonic barometric arrays are feeding direct live indices. All channels are operating within optimal scientific parameters.
                      </p>
                    </div>

                    <div className="p-4 bg-slate-950/50 border border-slate-850 rounded-xl select-none">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <strong className="text-emerald-400 font-semibold block mb-1 font-sans">💡 Laboratory Operational Guide</strong>
                        Our dashboard simulates 10 seconds of severe geological stress vectors. Scroll the slider below, choose a dynamic category, and manipulate variables in real time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Full-Width swipable & clickable Carousel Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <div className="flex items-center gap-2.5">
                      <Compass className="h-5 w-5 text-emerald-400" />
                      <h2 className="text-lg font-bold text-white tracking-tight select-text">
                        Planetary Disruption Vector Models
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 uppercase tracking-widest select-none">
                      {totalItems} Channels Available
                    </span>
                  </div>

                  {/* Carousel Container */}
                  <div className="relative group/carousel">
                    
                    {/* Navigation Buttons: Prev */}
                    <button
                      onClick={handlePrev}
                      disabled={carouselIndex === 0}
                      className={`absolute left-[-12px] sm:left-[-20px] lg:left-[-24px] top-[45%] -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900 border border-slate-850 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-all cursor-pointer shadow-md shadow-slate-950/80 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none`}
                      aria-label="Previous simulation"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Navigation Buttons: Next */}
                    <button
                      onClick={handleNext}
                      disabled={carouselIndex === maxIndex}
                      className={`absolute right-[-12px] sm:right-[-20px] lg:right-[-24px] top-[45%] -translate-y-1/2 z-30 p-2.5 rounded-full bg-slate-900 border border-slate-850 text-slate-400 hover:text-emerald-400 hover:border-slate-700 transition-all cursor-pointer shadow-md shadow-slate-950/80 hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none`}
                      aria-label="Next simulation"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Carousel Viewport */}
                    <div 
                      className="overflow-hidden w-full touch-pan-y cursor-grab active:cursor-grabbing select-none"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                      onMouseDown={handleMouseDown}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseLeave}
                    >
                      <div 
                        className="flex transition-transform duration-500 ease-out"
                        style={{
                          transform: `translateX(-${carouselIndex * (100 / visibleItems)}%)`,
                        }}
                      >
                        {DISASTER_PROFILES.map((profile) => (
                          <div 
                            key={profile.type} 
                            style={{ width: `${100 / visibleItems}%` }}
                            className="flex-shrink-0 px-2.5"
                          >
                            <DisasterCard
                              profile={profile}
                              onClick={() => handleSelectDisaster(profile)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Drag / Swipe instructional handle for mobile/desktop */}
                    <div className="flex justify-center items-center gap-1.5 text-[10px] text-slate-500 font-mono select-none mt-2.5">
                      <span>← Drag with mouse or swipe to explore vector models →</span>
                    </div>

                  </div>

                  {/* Indicator tracking dots */}
                  {maxIndex > 0 && (
                    <div className="flex justify-center items-center gap-2 pt-2 select-none">
                      {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCarouselIndex(i)}
                          className={`transition-all duration-300 cursor-pointer h-2 rounded-full ${
                            carouselIndex === i 
                              ? "bg-emerald-400 w-5" 
                              : "bg-slate-800 hover:bg-slate-700 w-2"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}

                </div>

                {/* Feedback form & Proposed upgrades section */}
                <div className="pt-10 border-t border-slate-900">
                  <FeedbackSection />
                </div>
              </div>
            )}

            {currentView === "about" && <AboutView />}
            {currentView === "privacy" && <PrivacyView />}
            {currentView === "contact" && <ContactView />}
          </>
        )}
      </main>

      {/* Global institutional Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-xs text-slate-500 font-medium select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Compass className="h-4 w-4 text-emerald-500" />
            <span className="font-bold text-slate-300">Nature's Rage Portal</span>
            <span className="text-slate-800">|</span>
            <span>Planetary Sciences Division © 2026</span>
          </div>

          <div className="flex items-center gap-5 flex-wrap justify-center font-semibold">
            <button 
              onClick={() => handleNavigate("home")} 
              className="hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Simulators
            </button>
            <button 
              onClick={() => handleNavigate("about")} 
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HelpCircle className="h-3 w-3" />
              About
            </button>
            <button 
              onClick={() => handleNavigate("privacy")} 
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Shield className="h-3 w-3" />
              Privacy Policy
            </button>
            <button 
              onClick={() => handleNavigate("contact")} 
              className="hover:text-emerald-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Mail className="h-3 w-3" />
              Contact
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
