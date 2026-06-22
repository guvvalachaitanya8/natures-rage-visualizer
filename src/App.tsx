import { useState, useEffect } from "react";
import NatureNavbar from "./components/NatureNavbar";
import DisasterCard from "./components/DisasterCard";
import DisasterSimulator from "./components/DisasterSimulator";
import FeedbackSection from "./components/FeedbackSection";
import Helmet from "./components/Helmet";
import { AboutView, PrivacyView, ContactView } from "./components/AboutPrivacyContactViews";
import { DISASTER_PROFILES } from "./data";
import { DisasterProfile } from "./types";
import { Sparkles, Compass, HelpCircle, Shield, Mail } from "lucide-react";
import { apiFetch } from "./utils/api";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "about" | "privacy" | "contact">(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/about") return "about";
      if (path === "/privacy") return "privacy";
      if (path === "/contact") return "contact";
    }
    return "home";
  });
  const [activeDisaster, setActiveDisaster] = useState<DisasterProfile | null>(null);

  // Dynamic layout texts fetched from backend configuration store
  const [heroTitle, setHeroTitle] = useState<string>("Nature's Destructive Phases");
  const [heroDescription, setHeroDescription] = useState<string>(
    "Operate dynamic 10-second AI-powered simulations of Earth's extreme geophysical transformations. Toggle visual styles directly from our research vectors between clean schematic representations and high-fidelity volumetric particle systems."
  );

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
      const path = typeof window !== "undefined" ? window.location.pathname : "";

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
      window.addEventListener("popstate", handlePopState);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("popstate", handlePopState);
      }
    };
  }, []);

  // Router dispatcher
  const handleNavigate = (view: "home" | "about" | "privacy" | "contact") => {
    setCurrentView(view);
    setActiveDisaster(null); // return to home when clicking navbar
    window.history.pushState(null, "", view === "home" ? "/" : `/${view}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectDisaster = (profile: DisasterProfile) => {
    setActiveDisaster(profile);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnHome = () => {
    setActiveDisaster(null);
    setCurrentView("home");
    window.history.pushState(null, "", "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-12">
                
                {/* Unified single-view dashboard structure */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Info panel with Title & Description */}
                  <div className="lg:col-span-12 xl:col-span-5 lg:sticky lg:top-24 space-y-5 lg:pr-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-full uppercase tracking-widest font-mono select-none">
                      <Sparkles className="h-3 w-3 text-emerald-400 animate-pulse" />
                      Continuous Planetary Core Telemetry
                    </div>

                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight select-text">
                      {heroTitle}
                    </h1>

                    <p className="text-slate-400 text-sm leading-relaxed select-text">
                      {heroDescription}
                    </p>

                    <div className="pt-5 border-t border-slate-900 grid grid-cols-2 gap-3 text-[11px] font-mono text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>📡 Seismological</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                        <span>🌋 Volcanic</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                        <span>🌊 Hydrological</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span>🌪️ Climatological</span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/30 border border-slate-900 rounded-xl select-none">
                      <p className="text-xs text-slate-400 leading-relaxed">
                        <strong className="text-emerald-400 font-semibold block mb-0.5">💡 Laboratory Operational Guide</strong>
                        Select any planetary disruption vector on the right to load the active physical metrics dashboard and customized dynamic numerical simulation triggers.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: High-density disruption vector card models grid */}
                  <div className="lg:col-span-12 xl:col-span-7 space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                      <div>
                        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 select-text">
                          <Compass className="h-4.5 w-4.5 text-emerald-400" />
                          Planetary Disruption Vector Models
                        </h2>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 uppercase tracking-widest select-none">
                        6 Channels Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {DISASTER_PROFILES.map((profile) => (
                        <DisasterCard
                          key={profile.type}
                          profile={profile}
                          onClick={() => handleSelectDisaster(profile)}
                        />
                      ))}
                    </div>
                  </div>

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
