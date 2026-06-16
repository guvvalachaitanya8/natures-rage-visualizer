import { useState } from "react";
import NatureNavbar from "./components/NatureNavbar";
import DisasterCard from "./components/DisasterCard";
import DisasterSimulator from "./components/DisasterSimulator";
import FeedbackSection from "./components/FeedbackSection";
import { AboutView, PrivacyView, ContactView } from "./components/AboutPrivacyContactViews";
import { DISASTER_PROFILES } from "./data";
import { DisasterProfile } from "./types";
import { Info, Sparkles, Compass, Shield, HelpCircle, Mail } from "lucide-react";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "about" | "privacy" | "contact">("home");
  const [activeDisaster, setActiveDisaster] = useState<DisasterProfile | null>(null);

  // Router dispatcher
  const handleNavigate = (view: "home" | "about" | "privacy" | "contact") => {
    setCurrentView(view);
    setActiveDisaster(null); // return to home/disaster list when clicking navbar
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectDisaster = (profile: DisasterProfile) => {
    setActiveDisaster(profile);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReturnHome = () => {
    setActiveDisaster(null);
    setCurrentView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
          
          {/* Shared Global Top Navbar Brand */}
          <NatureNavbar 
            currentView={activeDisaster ? "simulator" : currentView} 
            onNavigate={handleNavigate} 
          />

          {/* Main Container */}
          <main className="flex-grow">
            {activeDisaster ? (
              // Separate Disaster lab view
              <DisasterSimulator 
                profile={activeDisaster} 
                onBack={handleReturnHome} 
              />
            ) : (
              // Traditional SPA routing views
              <>
                {currentView === "home" && (
                  <div className="py-12 space-y-16">
                    
                    {/* Hero research section */}
                    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
                      {/* Subtle vector circles decoration in background */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] rounded-full border border-slate-900/40 pointer-events-none -z-10" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full border border-slate-900/20 pointer-events-none -z-10" />

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 rounded-full mb-4 uppercase tracking-widest">
                        <Sparkles className="h-3 w-3 text-emerald-400" />
                        Continuous Planetary Core telemetry
                      </div>

                      <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
                        Nature's <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Destructive Phases</span>
                      </h1>

                      <p className="mt-4 text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
                        Operate dynamic 10-second AI-powered simulations of Earth's extreme geophysical transformations. Toggle visual styles directly from our research vectors between clean schematic representations and high-fidelity volumetric particle systems.
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

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DISASTER_PROFILES.map((profile) => (
                          <DisasterCard
                            key={profile.type}
                            profile={profile}
                            onClick={() => handleSelectDisaster(profile)}
                          />
                        ))}
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

              <div className="flex items-center gap-5 flex-wrap justify-center">
                <button 
                  onClick={() => handleNavigate("home")} 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  Simulators
                </button>
                <button 
                  onClick={() => handleNavigate("about")} 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <HelpCircle className="h-3 w-3" />
                  About
                </button>
                <button 
                  onClick={() => handleNavigate("privacy")} 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <Shield className="h-3 w-3" />
                  Privacy Policy
                </button>
                <button 
                  onClick={() => handleNavigate("contact")} 
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
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
