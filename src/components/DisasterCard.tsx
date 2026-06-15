import { DisasterProfile } from "../types";
import { 
  Activity, 
  Flame, 
  Waves, 
  Wind, 
  CloudLightning, 
  Droplets, 
  ArrowRight 
} from "lucide-react";

interface DisasterCardProps {
  key?: string;
  profile: DisasterProfile;
  onClick: () => void;
}

export default function DisasterCard({ profile, onClick }: DisasterCardProps) {
  // Select icon
  const getIcon = () => {
    switch (profile.type) {
      case "earthquake":
        return <Activity className="h-6 w-6" style={{ color: profile.accentColor }} />;
      case "volcano":
        return <Flame className="h-6 w-6" style={{ color: profile.accentColor }} />;
      case "tsunami":
        return <Waves className="h-6 w-6" style={{ color: profile.accentColor }} />;
      case "cyclone":
        return <Wind className="h-6 w-6" style={{ color: profile.accentColor }} />;
      case "tornado":
        return <CloudLightning className="h-6 w-6" style={{ color: profile.accentColor }} />;
      case "flood":
        return <Droplets className="h-6 w-6" style={{ color: profile.accentColor }} />;
    }
  };

  // Render descriptive SVG vector patterns based on disaster type for extreme premium polish
  const renderVectorPattern = () => {
    const stroke = profile.accentColor;
    switch (profile.type) {
      case "earthquake":
        return (
          <svg className="w-full h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 50 L40 50 L50 20 L65 80 L75 40 L85 60 L95 20 L115 90 L125 45 L135 55 L145 10 L155 70 L165 50 L190 50" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="10" y1="50" x2="190" y2="50" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
            {/* Fault lines */}
            <path d="M30 90 L80 65 L110 80 L170 50" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path d="M30 10 M170 90" stroke="none" />
          </svg>
        );
      case "volcano":
        return (
          <svg className="w-full h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Volcano cone */}
            <path d="M40 90 L85 30 L115 30 L160 90 Z" fill="rgba(30,41,59,0.5)" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            {/* Molten lava */}
            <path d="M85 30 Q100 50 100 90 M98 30 Q110 45 112 70 M115 32 Q130 55 122 90" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
            {/* Plume cloud */}
            <circle cx="100" cy="20" r="14" fill="rgba(239, 68, 68, 0.15)" stroke={stroke} strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="85" cy="18" r="10" fill="rgba(239, 68, 68, 0.1)" />
            <circle cx="115" cy="18" r="10" fill="rgba(239, 68, 68, 0.1)" />
            <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(255,255,255,0.1)" />
          </svg>
        );
      case "tsunami":
        return (
          <svg className="w-full h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 90 Q30 90 50 80 T100 80 T130 40 Q150 15 175 40 Q185 50 200 52" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
            <path d="M0 95 Q30 95 50 85 T100 85 T130 45 Q150 20 178 45 Q188 55 200 57" stroke="rgba(6, 182, 212, 0.6)" strokeWidth="1.5" />
            <path d="M165 40 Q170 30 178 30 Q185 32 190 40" stroke="white" strokeWidth="1.5" strokeDasharray="3 3" />
            {/* Underwater ground */}
            <path d="M0 90 L120 90 L150 70 L200 65" stroke="rgba(255,255,255,0.1" strokeWidth="2" />
          </svg>
        );
      case "cyclone":
        return (
          <svg className="w-full h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Multi-layered spiral eye */}
            <circle cx="100" cy="50" r="8" stroke={stroke} strokeWidth="2" strokeDasharray="4 4" />
            <path d="M100 30 A20 20 0 0 1 120 50 A20 20 0 0 1 100 70 A20 20 0 0 1 80 50" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M100 15 A35 35 0 0 1 135 50 A35 35 0 0 1 100 85 A35 35 0 0 1 65 50" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M100 2 Q148 2 148 50 Q148 98 100 98 Q52 98 52 50 Z" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            {/* Wind rays */}
            <path d="M70 25 Q100 10 130 25" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
            <path d="M70 75 Q100 90 130 75" stroke={stroke} strokeWidth="1" strokeLinecap="round" />
          </svg>
        );
      case "tornado":
        return (
          <svg className="w-full h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Spinning cloud cone */}
            <path d="M70 10 Q100 10 130 10 T105 40 T100 65 T98 90 T100 92 Q100 85 95 65 T90 40 T70 10 Z" fill="rgba(59, 130, 246, 0.08)" stroke={stroke} strokeWidth="1.5" />
            {/* Spiral swish lines */}
            <path d="M65 15 Q100 35 135 15" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
            <path d="M75 35 Q100 50 125 35" stroke={stroke} strokeWidth="1.5" />
            <path d="M85 55 Q100 65 115 55" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <path d="M92 75 Q100 80 108 75" stroke={stroke} strokeWidth="2" />
            <ellipse cx="100" cy="90" rx="12" ry="4" stroke="white" strokeWidth="1" />
          </svg>
        );
      case "flood":
        return (
          <svg className="w-full h-28 opacity-40 group-hover:opacity-70 transition-opacity duration-300" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* House partially submerged */}
            <path d="M45 70 L65 50 L85 70 Z M48 70 L48 95 L82 95 L82 70" fill="rgba(15,23,42,0.6)" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            <line x1="45" y1="70" x2="85" y2="70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
            {/* Rising water grid */}
            <path d="M10 65 C25 60 30 70 45 65 C60 60 70 70 85 65 C100 60 110 70 125 65 C140 60 150 70 165 65 C180 60 185 70 195 65" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" />
            <path d="M10 80 C25 75 30 85 45 80 C60 75 70 85 85 80 C100 75 110 85 125 80 C140 75 150 85 165 80 C180 75 185 85 195 80" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 2" />
            <line x1="10" y1="92" x2="190" y2="92" stroke={stroke} strokeWidth="1" />
          </svg>
        );
    }
  };

  return (
    <div 
      id={`card-${profile.type}`}
      onClick={onClick}
      className="group relative flex flex-col justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 hover:shadow-2xl hover:shadow-emerald-950/10 rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Background Subtle glow */}
      <div 
        className="absolute -top-12 -right-12 h-24 w-24 rounded-full blur-3xl transition-opacity duration-300"
        style={{ backgroundColor: profile.accentColor, opacity: 0.15 }}
      />

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 transition-colors group-hover:border-slate-700">
            {getIcon()}
          </div>
          <span className="text-[11px] font-mono tracking-wider font-semibold text-slate-500 uppercase">
            {profile.parameterName}
          </span>
        </div>

        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2 flex items-center gap-2">
          {profile.title}
        </h3>
        
        <p className="text-slate-400 text-xs leading-relaxed mb-4">
          {profile.shortDescription}
        </p>
      </div>

      {/* Vector Visualization Indicator */}
      <div className="my-2 p-2 bg-slate-950/40 rounded-lg border border-slate-950 flex items-center justify-center">
        {renderVectorPattern()}
      </div>

      {/* Card Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">
          Unit: {profile.unitLabel}
        </span>
        <button 
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 group-hover:text-emerald-300 group-hover:gap-2 transition-all"
        >
          Simulation Lab 
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
