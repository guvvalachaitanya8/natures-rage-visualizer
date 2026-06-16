import { Compass, Globe, HelpCircle, Shield, Mail, Lock } from "lucide-react";

interface NatureNavbarProps {
  currentView: "home" | "about" | "privacy" | "contact" | "admin" | string;
  onNavigate: (view: "home" | "about" | "privacy" | "contact" | "admin") => void;
}

export default function NatureNavbar({ currentView, onNavigate }: NatureNavbarProps) {
  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div 
            onClick={() => onNavigate("home")} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="p-2 bg-slate-900 rounded-lg border border-slate-750 group-hover:border-emerald-500 transition-colors">
              <Compass className="h-5 w-5 text-emerald-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                TerraForce <span className="text-xs font-semibold text-emerald-400 px-1.5 py-0.5 bg-emerald-950/60 rounded border border-emerald-900">Research</span>
              </h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest hidden sm:block">Destructive Phases Simulator</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => onNavigate("home")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "home"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span className="hidden xs:inline">Simulators</span>
            </button>

            <button
              onClick={() => onNavigate("about")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "about"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <HelpCircle className="h-4 w-4" />
              <span>About</span>
            </button>

            <button
              onClick={() => onNavigate("privacy")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "privacy"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </button>

            <button
              onClick={() => onNavigate("contact")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "contact"
                  ? "bg-slate-900 border border-slate-800 text-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Mail className="h-4 w-4" />
              <span>Contact</span>
            </button>

            <button
              onClick={() => onNavigate("admin")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "admin"
                  ? "bg-slate-900 border border-slate-800 text-[#f59e0b]"
                  : "text-slate-500 hover:text-[#f59e0b] hover:bg-slate-900/50"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
