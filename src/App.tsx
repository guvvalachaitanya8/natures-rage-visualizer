import { useState, useEffect } from "react";
import NatureNavbar from "./components/NatureNavbar";
import DisasterCard from "./components/DisasterCard";
import DisasterSimulator from "./components/DisasterSimulator";
import FeedbackSection from "./components/FeedbackSection";
import AdminDashboard from "./components/AdminDashboard";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Helmet from "./components/Helmet";
import { AboutView, PrivacyView, ContactView } from "./components/AboutPrivacyContactViews";
import { DISASTER_PROFILES } from "./data";
import { DisasterProfile } from "./types";
import { Sparkles, Compass, HelpCircle, Shield, Mail } from "lucide-react";
import { apiFetch } from "./utils/api";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "about" | "privacy" | "contact" | "admin">("home");
  const [activeDisaster, setActiveDisaster] = useState<DisasterProfile | null>(null);

  // Dynamic layout texts fetched from admin configuration store
  const [heroTitle, setHeroTitle] = useState<string>("Nature's Destructive Phases");
  const [heroDescription, setHeroDescription] = useState<string>(
    "Operate dynamic 10-second AI-powered simulations of Earth's extreme geophysical transformations. Toggle visual styles directly from our research vectors between clean schematic representations and high-fidelity volumetric particle systems."
  );

  // Handle Dynamic Editorial Configuration & Page View Tracking
  useEffect(() => {
    // Check if URL pattern starts with administrative console hash
    if (window.location.pathname === "/admin" || window.location.hash === "#admin" || window.location.hash === "/admin") {
      setCurrentView("admin");
      setActiveDisaster(null);
    }

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

  // Router dispatcher
  const handleNavigate = (view: "home" | "about" | "privacy" | "contact" | "admin") => {
    setCurrentView(view);
    setActiveDisaster(null); // return to home when clicking navbar
    if (view === "admin") {
      window.history.pushState(null, "", "/admin");
    } else {
      window.history.pushState(null, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectDisaster = (profile: DisasterProfile) => {
    setActiveDisaster(profile);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnHome = () => {
    setActiveDisaster(null);
    setCurrentView("home");
    // Clear admin hashes on return
    if (window.location.pathname === "/admin" || window.location.hash.includes("admin")) {
      window.history.pushState(null, "", "/");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dynamic SEO metadata dispatcher for optimal search indexing & AdSense compatibility
  const getHelmetMeta = () => {
    if (activeDisaster) {
      return {
        title: `${activeDisaster.title} Core Simulation Lab | TerraForce`,
        description: `Simulate high-fidelity physical models of ${activeDisaster.title.toLowerCase()}. ${activeDisaster.shortDescription} Analyze seismological patterns, wind currents, climate forecasts, and direct protective guidance.`
      };
    }
    switch (currentView) {
      case "about":
        return {
          title: "About Advanced Geological Simulation Hub | TerraForce",
          description: "Meet TerraForce, the premier research portal dedicated to scientific 10-second simulations of complex geophysical transformations and extreme natural disaster events."
        };
      case "privacy":
        return {
          title: "Privacy Shield & Security Parameters | TerraForce",
          description: "Explore the security guidelines, data protection protocols, and cookie optimization policies guiding scientific telemetry validation at TerraForce."
        };
      case "contact":
        return {
          title: "Establish Institutional Contact | TerraForce Portal",
          description: "Connect with our research division, clear executive compliance checks, or file scientific comments regarding geological/meteorological modeling frameworks."
        };
      case "admin":
        return {
          title: "Aegis Command Center - Secure Credentials Gateway | TerraForce",
          description: "Access control telemetry, edit live hero layouts, and monitor suspect network behavior on the secure administrative port authority matrix."
        };
      case "home":
      default:
        return {
          title: "TerraForce Portal - Advanced 10-Second Planetary Natural Disaster Simulators",
          description: "Operate high-fidelity AI-powered physical simulations of major Earth transformations including Volcano Eruptions, Tsunamis, Earthquakes, Cyclones, and more."
        };
    }
  };

  const { title: pageTitle, description: pageDescription } = getHelmetMeta();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Dynamic SEO / AdSense Metadata Helmet */}
      <Helmet title={pageTitle} description={pageDescription} />
      {/* Shared Global Top Navbar Brand (Admin view hides navbar for modularity & focus) */}
      {currentView !== "admin" && (
        <NatureNavbar 
          currentView={activeDisaster ? "simulator" : currentView} 
          onNavigate={handleNavigate} 
        />
      )}

      {/* Main Container */}
      <main className="flex-grow">
        {currentView === "admin" ? (
          /* Secure Admin View mapping protected with JWT token gating */
          <AdminProtectedRoute 
            onBack={handleReturnHome}
            onAuthenticated={(token) => {
              // Secured connection confirmed
            }}
          >
            <AdminDashboard 
              onBack={handleReturnHome} 
              onLogout={() => {
                handleReturnHome();
              }}
            />
          </AdminProtectedRoute>
        ) : activeDisaster ? (
          /* Separate Disaster lab view */
          <DisasterSimulator 
            profile={activeDisaster} 
            onBack={handleReturnHome} 
          />
        ) : (
          /* Traditional SPA routing views */
          <>
            {currentView === "home" && (
              <div className="py-12 space-y-16">
                
                {/* 6 Disaster card blocks grid */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-4 mb-8">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Compass className="h-5 w-5 text-emerald-400" />
                        Select a Disruption Vector Model
                      </h2>
                      <p className="text-xs text-slate-500 font-medium">Click a card profile to open its dynamic parameters control page.</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500">6 Profiles Instantiated</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {DISASTER_PROFILES.map((profile) => (
                      <DisasterCard
                        key={profile.type}
                        profile={profile}
                        onClick={() => handleSelectDisaster(profile)}
                      />
                    ))}
                  </div>
                </section>

                {/* Hero research section */}
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden select-text">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full border border-slate-900/40 pointer-events-none -z-10" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full border border-slate-900/20 pointer-events-none -z-10" />

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-full mb-4 uppercase tracking-widest">
                    <Sparkles className="h-3 w-3 text-emerald-400" />
                    Continuous Planetary Core telemetry
                  </div>

                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
                    {heroTitle}
                  </h1>

                  <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
                    {heroDescription}
                  </p>

                  <div className="mt-8 p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl max-w-2xl mx-auto text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-center gap-2 flex-wrap">
                    <span>📡 Seismological</span>
                    <span className="text-slate-800">•</span>
                    <span>🌋 Volcanic</span>
                    <span className="text-slate-800">•</span>
                    <span>🌊 Hydrological</span>
                    <span className="text-slate-800">•</span>
                    <span>🌪️ Climatological</span>
                  </div>
                </section>

                {/* Feedback form & Update requests lists at bottom of home view */}
                <FeedbackSection />
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
            <span className="font-bold text-slate-300">TerraForce Research Portal</span>
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
            <button 
              onClick={() => handleNavigate("admin")} 
              className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer font-semibold"
            >
              🔒 Admin Panel
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
