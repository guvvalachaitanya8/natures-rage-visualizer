import { useEffect, useRef, useState } from "react";
import { DisasterProfile, VisualStyle, SimulationResult, SimulationGraphPoint } from "../types";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  AlertTriangle, 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  Info,
  Clock
} from "lucide-react";

interface DisasterSimulatorProps {
  profile: DisasterProfile;
  onBack: () => void;
}

export default function DisasterSimulator({ profile, onBack }: DisasterSimulatorProps) {
  const [selectedOption, setSelectedOption] = useState<string>(profile.options[2]); // Default middle option
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("realistic");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  
  // Real-time search & validation states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [customMagnitude, setCustomMagnitude] = useState<string>("");
  const [customError, setCustomError] = useState<string>("");

  // Sync state parameters when profile shifts
  useEffect(() => {
    setSearchQuery("");
    setSearchError("");
    setCustomMagnitude("");
    setCustomError("");
    // Guard against potential out of bounds or empty options array
    if (profile.options && profile.options.length > 2) {
      setSelectedOption(profile.options[2]);
    } else if (profile.options && profile.options.length > 0) {
      setSelectedOption(profile.options[0]);
    }
  }, [profile.type]);

  const getExampleValue = (type: string) => {
    switch (type) {
      case "earthquake": return "7.5 (Richter)";
      case "volcano": return "950 (°C)";
      case "tsunami": return "25 (meters)";
      case "cyclone": return "4 (Category)";
      case "tornado": return "3 (EF)";
      case "flood": return "8.5 (feet)";
      default: return "5";
    }
  };

  const validateCustomMagnitude = (val: string, type: string) => {
    if (!val.trim()) {
      return "";
    }

    // Extract numeric prefix or number
    let cleanVal = val.trim()
      .replace(/ Richter/gi, "")
      .replace(/m/gi, "")
      .replace(/ft/gi, "")
      .replace(/°C/gi, "")
      .replace(/C/gi, "")
      .replace(/EF/gi, "")
      .replace(/Cat /gi, "")
      .replace(/Cat/gi, "")
      .trim();

    const num = Number(cleanVal);

    if (isNaN(num)) {
      return "Error: Input must be a valid numeric intensity value. Special characters or letters are not allowed.";
    }

    switch (type) {
      case "earthquake":
        if (num < 0.1 || num > 10.0) {
          return "Error: Earthquake magnitude must be a number between 0.1 and 10.0 on the Richter scale.";
        }
        break;
      case "volcano":
        if (num < 100 || num > 3000) {
          return "Error: Volcano temperature must be a number between 100°C and 3000°C.";
        }
        break;
      case "tsunami":
        if (num < 0.5 || num > 150) {
          return "Error: Tsunami wave height must be a number between 0.5m and 150m.";
        }
        break;
      case "flood":
        if (num < 0.5 || num > 120) {
          return "Error: Flood inundation depth must be a number between 0.5 and 120 feet.";
        }
        break;
      case "cyclone":
        if (num >= 1 && num <= 5) {
          // Valid category
        } else if (num >= 74 && num <= 400) {
          // Valid km/h wind speed
        } else {
          return "Error: Cyclone intensity must be a Saffir-Simpson category (1-5) or speed (74-400 km/h).";
        }
        break;
      case "tornado":
        if (num >= 0 && num <= 5) {
          // Valid EF Category
        } else if (num >= 100 && num <= 500) {
          // Valid wind speed
        } else {
          return "Error: Tornado scale must be an EF Category (0-5) or wind speed (100-500 km/h).";
        }
        break;
      default:
        if (num <= 0) {
          return "Error: Please enter a positive number.";
        }
    }

    return "";
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchError("");
      return;
    }
    
    const matches = profile.options.filter(opt => 
      opt.toLowerCase().includes(query.toLowerCase())
    );
    
    if (matches.length === 0) {
      setSearchError(`No predefined options match "${query}". Enter a custom magnitude on the right if needed.`);
    } else {
      setSearchError("");
    }
  };

  const handleCustomMagnitudeChange = (val: string) => {
    setCustomMagnitude(val);
    const err = validateCustomMagnitude(val, profile.type);
    setCustomError(err);
  };

  const handleApplyCustomMagnitude = () => {
    const err = validateCustomMagnitude(customMagnitude, profile.type);
    if (err) {
      setCustomError(err);
      return;
    }

    let cleanVal = customMagnitude.trim()
      .replace(/ Richter/gi, "")
      .replace(/m/gi, "")
      .replace(/ft/gi, "")
      .replace(/°C/gi, "")
      .replace(/C/gi, "")
      .replace(/EF/gi, "")
      .replace(/Cat /gi, "")
      .replace(/Cat/gi, "")
      .trim();

    let suffix = "";
    if (profile.type === "earthquake") suffix = " Richter";
    else if (profile.type === "volcano") suffix = "°C";
    else if (profile.type === "tsunami") suffix = "m Wave";
    else if (profile.type === "flood") suffix = " ft";
    else if (profile.type === "cyclone") {
      const valNum = Number(cleanVal);
      suffix = valNum <= 5 ? ` (Cat ${valNum})` : " km/h";
    }
    else if (profile.type === "tornado") {
      const valNum = Number(cleanVal);
      suffix = valNum <= 5 ? ` (EF${valNum})` : " km/h";
    }

    setSelectedOption(`${cleanVal}${suffix}`);
    setConsoleLogs(prev => [...prev, `[USER] Applied custom ${profile.parameterName}: ${cleanVal}${suffix}`]);
  };

  // Player control state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0.0); // 0.0 to 10.0 seconds
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0.0);
  const isPlayingRef = useRef<boolean>(false);

  // Sync refs to avoid stale closures in requestAnimationFrame
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Handle run simulation / fetch data
  const triggerSimulationFetch = async (option: string, style: VisualStyle) => {
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0.0);
    timeRef.current = 0.0;
    
    // Set loading console signs
    setConsoleLogs([
      `[SIMULATOR] Initiating physical grid parameters for ${profile.title}...`,
      `[AI AGENT] Communicating with Gemini server for complex simulation protocol...`,
    ]);

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disasterType: profile.type,
          intensity: option,
          style: style,
        }),
      });
      const data = await response.json();
      
      if (data.status === "success") {
        setSimResult(data);
        setConsoleLogs(prev => [
          ...prev,
          `[AI AGENT] Gemini research compile complete!`,
          `[DECIBEL] Acoustic density profile set: ${data.decibel}`,
          `[SIMULATOR] Ground sensors fully operational. Ready to play 10s video sequence.`
        ]);
      } else {
        throw new Error(data.message || "Failed to compile simulation data.");
      }
    } catch (err: any) {
      console.error(err);
      setConsoleLogs(prev => [...prev, `[ERROR] Failed to compile: ${err.message}. Using localized backup physics.`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger on load or parameter change
  useEffect(() => {
    triggerSimulationFetch(selectedOption, visualStyle);
  }, [profile.type, selectedOption, visualStyle]);

  // Console log triggers matching simulation time
  useEffect(() => {
    if (!isPlaying) return;
    
    const logsForTime = () => {
      const sec = Math.floor(timeRef.current);
      const intensity = simResult?.simulationConfig?.intensityMultiplier || 1.0;
      
      switch (sec) {
        case 1:
          return `[SYSTEM] Elapsed 1.0s: Primary shear force initiation. Wave velocity stable.`;
        case 3:
          return `[TELEMETRY] Elapsed 3.0s: Core wave front contact. Sensor load peaked at ${(intensity * 9.5).toFixed(1)} units.`;
        case 5:
          return `[SURVEY] Elapsed 5.0s: Peak structural turbulence. Material deformation yielding threshold detected.`;
        case 7:
          return `[DEBRIS] Elapsed 7.0s: Gravity fallout mass-particle decay active. Secondary thermal currents dissipating.`;
        case 9:
          return `[SYSTEM] Elapsed 9.0s: Simulation cycle settling. System entering structural assessment state.`;
        default:
          return null;
      }
    };

    const newLog = logsForTime();
    if (newLog) {
      setConsoleLogs(prev => {
        if (prev.includes(newLog)) return prev;
        return [...prev, newLog];
      });
    }
  }, [currentTime, isPlaying, simResult]);

  // Clock counter / progress loop
  useEffect(() => {
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      if (isPlayingRef.current) {
        const delta = (now - lastTime) / 1000.0;
        let nextTime = timeRef.current + delta;
        
        if (nextTime >= 10.0) {
          nextTime = 10.0;
          setIsPlaying(false);
          isPlayingRef.current = false;
          setConsoleLogs(prev => [...prev, `[SUCCESS] Simulation completed 10.0s sequence flawlessly.`]);
        }
        
        timeRef.current = nextTime;
        setCurrentTime(nextTime);
      }
      lastTime = now;
      requestRef.current = requestAnimationFrame(updateLoop);
    };

    requestRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Play controls
  const handleTogglePlay = () => {
    if (currentTime >= 10.0) {
      // restart
      setCurrentTime(0.0);
      timeRef.current = 0.0;
      setConsoleLogs([`[SIMULATOR] Resetting log sensors. Starting 10-second visualization video.`]);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTime(0.0);
    timeRef.current = 0.0;
    setConsoleLogs([`[SIMULATOR] Simulation playhead reset to 0.0s.`]);
  };

  // HTML5 CSS Canvas Drawing loop based on physics model, elapsed time and selected style
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let localAnimationFrame: number;
    let particles: Array<{ x: number; y: number; vx: number; vy: number; r: number; color: string; life: number; rot?: number; rotSpeed?: number }> = [];
    
    // Quick particle spawn helpers
    const spawnParticle = (x: number, y: number, angleMin: number, angleMax: number, speedMin: number, speedMax: number, sizeMin: number, sizeMax: number, color: string) => {
      const angle = angleMin + Math.random() * (angleMax - angleMin);
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: sizeMin + Math.random() * (sizeMax - sizeMin),
        color,
        life: 1.0,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.1
      });
    };

    const draw = () => {
      const t = timeRef.current; // 0 to 10
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear with dark tech theme
      ctx.fillStyle = "#020617"; // Slate-950
      ctx.fillRect(0, 0, width, height);

      // Grid background to look professional
      ctx.strokeStyle = "rgba(51, 65, 85, 0.15)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Read configurations
      const mult = simResult?.simulationConfig?.intensityMultiplier || 1.0;
      const speed = simResult?.simulationConfig?.speedFactor || 1.0;
      const colorTheme = simResult?.simulationConfig?.colorTheme || profile.accentColor;
      const isCartoon = visualStyle === "cartoon";

      // Draw custom disaster scenes based on time played
      switch (profile.type) {
        case "earthquake": {
          // EARTHQUAKE VISUALIZATION
          ctx.save();
          // Ground shake offset calculated based on intensity, time played, and if playing
          let shakeX = 0;
          let shakeY = 0;
          if (isPlayingRef.current && t > 0.5 && t < 9.5) {
            const shakeFreq = 45;
            // Shaking amplitude follows a custom earthquake curve
            const curve = Math.sin((t / 10.0) * Math.PI);
            const amp = mult * 8.0 * curve;
            shakeX = Math.sin(t * shakeFreq) * amp * (isCartoon ? 1.6 : 1.0);
            shakeY = Math.cos(t * shakeFreq * 1.2) * amp * (isCartoon ? 1.6 : 1.0);
          }
          ctx.translate(shakeX, shakeY);

          // Draw Ground blocks
          const groundY = height * 0.7;
          
          if (isCartoon) {
            // Cartoon style: Bold cartoon lines, bright flats
            // Sky background fill
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, width, groundY);
            
            // Draw stylized background hills
            ctx.fillStyle = "#1e293b";
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.quadraticCurveTo(width * 0.25, groundY - 60, width * 0.5, groundY);
            ctx.quadraticCurveTo(width * 0.75, groundY - 40, width, groundY);
            ctx.fill();

            // Draw tectonic ground with simplified crack lines
            ctx.fillStyle = "#451a03"; // Brown flat
            ctx.fillRect(0, groundY, width, height - groundY);
            ctx.strokeStyle = "#78350f";
            ctx.lineWidth = 10;
            ctx.strokeRect(0, groundY, width, height - groundY);

            // Crack propagation based on time
            if (t > 2.0) {
              ctx.strokeStyle = "#fb923c"; // Orange crack line
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.moveTo(width / 2, groundY);
              const crackHeight = Math.min((t - 2.0) / 8.0 * (height - groundY), height - groundY);
              ctx.lineTo(width / 2 - 15, groundY + crackHeight * 0.3);
              ctx.lineTo(width / 2 + 10, groundY + crackHeight * 0.6);
              ctx.lineTo(width / 2, groundY + crackHeight);
              ctx.stroke();
            }

            // Cartoonish building shaking and crumbling
            const bX = width * 0.3;
            const bY = groundY;
            const bW = 60;
            const bH = 120;
            
            ctx.save();
            // Tilt building based on shake
            if (t > 3.0) {
              const tilt = Math.sin(t * 12) * 0.05 * mult;
              ctx.translate(bX + bW / 2, bY);
              ctx.rotate(tilt);
              ctx.translate(-(bX + bW / 2), -bY);
            }
            // Draw Cartoon Building
            ctx.fillStyle = "#334155";
            ctx.fillRect(bX, bY - bH, bW, bH);
            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 4;
            ctx.strokeRect(bX, bY - bH, bW, bH);

            // Windows
            ctx.fillStyle = t > 4.0 && Math.floor(t * 5) % 2 === 0 ? "#fef08a" : "#1e293b";
            for (let wx = 0; wx < 2; wx++) {
              for (let wy = 0; wy < 4; wy++) {
                ctx.fillRect(bX + 10 + wx * 25, bY - bH + 10 + wy * 25, 15, 15);
              }
            }
            ctx.restore();

            // Cartoon shockwave circles
            if (isPlayingRef.current && t > 1.0) {
              ctx.strokeStyle = "rgba(251, 146, 60, 0.6)";
              ctx.lineWidth = 4;
              ctx.beginPath();
              ctx.arc(width / 2, groundY, (t * 55) % 180, 0, Math.PI, true);
              ctx.stroke();
            }

          } else {
            // Real Visual Type: High fidelity particle physics, dark cinematic lighting, glowing crack
            // Foggy atmosphere
            const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
            skyGrad.addColorStop(0, "#02020a");
            skyGrad.addColorStop(1, "#0d0e1a");
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, width, groundY);

            // Mountains in back
            ctx.fillStyle = "rgba(15, 17, 30, 0.8)";
            ctx.beginPath();
            ctx.moveTo(0, groundY);
            ctx.lineTo(120, groundY - 100);
            ctx.lineTo(250, groundY - 30);
            ctx.lineTo(390, groundY - 120);
            ctx.lineTo(width, groundY);
            ctx.closePath();
            ctx.fill();

            // Ground texture
            const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
            groundGrad.addColorStop(0, "#1f1811");
            groundGrad.addColorStop(1, "#070503");
            ctx.fillStyle = groundGrad;
            ctx.fillRect(0, groundY, width, height - groundY);

            // Real cracks split with lava/energy shine
            if (t > 1.5) {
              ctx.save();
              ctx.shadowColor = colorTheme;
              ctx.shadowBlur = 15;
              ctx.strokeStyle = colorTheme;
              ctx.lineWidth = 3 + mult * 1.5;
              ctx.beginPath();
              
              // Draw branching cracks
              ctx.moveTo(width / 2, groundY);
              const split = Math.min((t - 1.5) / 8.5, 1.0);
              
              let cy = groundY;
              let cx = width / 2;
              const pathPts = [
                {x: width/2 - 20, y: groundY + (height-groundY)*0.2},
                {x: width/2 + 25, y: groundY + (height-groundY)*0.4},
                {x: width/2 - 10, y: groundY + (height-groundY)*0.6},
                {x: width/2 + 15, y: groundY + (height-groundY)*0.8},
                {x: width/2, y: height}
              ];

              for (let i = 0; i < pathPts.length; i++) {
                if (split > i / pathPts.length) {
                  ctx.lineTo(pathPts[i].x, pathPts[i].y);
                }
              }
              ctx.stroke();
              ctx.restore();

              // Spawn realistic dust / debris particles along crack
              if (isPlayingRef.current && Math.random() < 0.3 * mult) {
                spawnParticle(
                  width / 2 + (Math.random() - 0.5) * 40,
                  groundY + Math.random() * (height - groundY) * split,
                  -Math.PI * 0.8, -Math.PI * 0.2,
                  1.0, 3.5,
                  1, 3,
                  "rgba(140, 120, 100, 0.7)"
                );
              }
            }

            // Real physical tower model undergoing seismic fatigue
            const bX = width * 0.7;
            const bY = groundY;
            const bW = 50;
            const bH = 150;
            ctx.save();
            
            // Shear displacement computation
            let shear = 0;
            if (t > 2.0 && isPlayingRef.current) {
              shear = Math.sin(t * 30) * 3.5 * mult * Math.sin((t-2)/8 * Math.PI);
            }

            // Draw architectural structural columns
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(bX, bY - bH, bW, bH);
            ctx.strokeStyle = "#475569";
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bX, bY - bH, bW, bH);

            // Rebars and fracturing shear cracks inside building
            if (t > 4.5) {
              ctx.strokeStyle = "rgba(220, 38, 38, 0.8)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(bX + 5, bY - 40);
              ctx.lineTo(bX + bW - 5, bY - 55);
              ctx.moveTo(bX + 10, bY - 90);
              ctx.lineTo(bX + bW - 10, bY - 110);
              ctx.stroke();
            }

            // Draw mechanical light flashes representing grid electrical surges
            if (isPlayingRef.current && t > 3.0 && t < 8.0 && Math.random() < 0.05) {
              ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
              ctx.fillRect(0, 0, width, height);
              setConsoleLogs(p => [...p, `[ALERT] 3.5s Electrical transformer failure detected at Station Grid G-4.`].slice(-8));
            }
            ctx.restore();
          }
          ctx.restore();
          break;
        }

        case "volcano": {
          // VOLCANO ERUPTION VISUALIZATION
          const coneX = width / 2;
          const coneY = height * 0.8;
          const coneW = 220;
          const coneH = 150;

          if (isCartoon) {
            // CARTOON VOLCANO
            // Draw background smoke clouds
            ctx.fillStyle = "#334155";
            ctx.beginPath();
            ctx.arc(coneX - 50, coneY - coneH - 40, 40 * mult, 0, Math.PI * 2);
            ctx.arc(coneX + 50, coneY - coneH - 40, 35 * mult, 0, Math.PI * 2);
            ctx.arc(coneX, coneY - coneH - 60, 50 * mult, 0, Math.PI * 2);
            ctx.fill();

            // Volcano cone
            ctx.fillStyle = "#27272a";
            ctx.beginPath();
            ctx.moveTo(coneX - coneW / 2, coneY);
            ctx.lineTo(coneX - 30, coneY - coneH);
            ctx.lineTo(coneX + 30, coneY - coneH);
            ctx.lineTo(coneX + coneW / 2, coneY);
            ctx.closePath();
            ctx.fill();
            ctx.strokeStyle = "#18181b";
            ctx.lineWidth = 8;
            ctx.stroke();

            // Eruption lava font
            if (t > 1.5) {
              const pulse = Math.sin(t * 15 * speed) * 15;
              ctx.fillStyle = "#ea580c"; // bright solid orange
              ctx.beginPath();
              ctx.arc(coneX, coneY - coneH, 25 * mult + pulse, Math.PI, 0);
              ctx.fill();
              
              // Cartoon splash lines
              ctx.strokeStyle = "#f97316";
              ctx.lineWidth = 6;
              ctx.beginPath();
              ctx.moveTo(coneX, coneY - coneH);
              ctx.lineTo(coneX - 60, coneY - coneH - 80 * mult);
              ctx.moveTo(coneX, coneY - coneH);
              ctx.lineTo(coneX + 60, coneY - coneH - 80 * mult);
              ctx.moveTo(coneX, coneY - coneH);
              ctx.lineTo(coneX + 10, coneY - coneH - 120 * mult);
              ctx.stroke();

              // Cartoonish Lava streams on cone sides
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 8;
              ctx.beginPath();
              ctx.moveTo(coneX - 25, coneY - coneH + 10);
              ctx.lineTo(coneX - 45, coneY - coneH + 60);
              ctx.lineTo(coneX - 70, coneY - coneH + 100);
              
              ctx.moveTo(coneX + 25, coneY - coneH + 10);
              ctx.lineTo(coneX + 45, coneY - coneH + 50);
              ctx.lineTo(coneX + 65, coneY - coneH + 120);
              ctx.stroke();
            }

            // Ground base draw
            ctx.fillStyle = "#18181b";
            ctx.fillRect(0, coneY, width, height - coneY);

          } else {
            // REALISTIC VOLCANO: Epic high fidelity gradients, dark skies, lightning arcs, flying rocks
            // Dark stormy ash sky gradient
            const skyG = ctx.createLinearGradient(0, 0, 0, coneY - coneH);
            skyG.addColorStop(0, "#020108");
            skyG.addColorStop(1, "#1c1410");
            ctx.fillStyle = skyG;
            ctx.fillRect(0, 0, width, height);

            // Realistic plume clouds at vent
            if (t > 1.0) {
              ctx.save();
              const ashRadius = (t * 12 * speed * mult) % 90 + 35;
              const fillAsh = ctx.createRadialGradient(coneX, coneY - coneH, 10, coneX, coneY - coneH, ashRadius);
              fillAsh.addColorStop(0, "rgba(220, 38, 38, 0.45)");
              fillAsh.addColorStop(0.3, "rgba(50, 40, 40, 0.8)");
              fillAsh.addColorStop(0.7, "rgba(24, 24, 35, 0.95)");
              fillAsh.addColorStop(1, "rgba(10, 10, 12, 0)");
              
              ctx.fillStyle = fillAsh;
              ctx.beginPath();
              ctx.arc(coneX, coneY - coneH - 40, ashRadius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            }

            // Draw Mountain structure
            const mountG = ctx.createLinearGradient(coneX - coneW/2, coneY, coneX, coneY - coneH);
            mountG.addColorStop(0, "#110b07");
            mountG.addColorStop(1, "#261711");
            ctx.fillStyle = mountG;
            ctx.beginPath();
            ctx.moveTo(coneX - coneW / 2, coneY);
            ctx.lineTo(coneX - 20, coneY - coneH);
            ctx.lineTo(coneX + 20, coneY - coneH);
            ctx.lineTo(coneX + coneW / 2, coneY);
            ctx.closePath();
            ctx.fill();
            
            // Draw crater mouth with intense glow
            if (t > 1.2) {
              ctx.save();
              ctx.shadowColor = "#ff2200";
              ctx.shadowBlur = 25;
              ctx.fillStyle = "#ffdd44";
              ctx.fillRect(coneX - 20, coneY - coneH - 4, 40, 8);
              ctx.restore();

              // Active glowing lava stream flow down mountain terrain
              ctx.save();
              ctx.shadowColor = "#ff3300";
              ctx.shadowBlur = 10;
              ctx.strokeStyle = "#ff4411";
              ctx.lineWidth = 3 + mult * 2;
              ctx.beginPath();
              
              // Flow path left
              ctx.moveTo(coneX - 15, coneY - coneH);
              ctx.lineTo(coneX - 25, coneY - coneH + 30);
              const flowLen = Math.min((t - 1.2) * 15 * speed, 150);
              if (flowLen > 30) ctx.lineTo(coneX - 45, coneY - coneH + flowLen * 0.6);
              if (flowLen > 90) ctx.lineTo(coneX - 75, coneY - coneH + flowLen);
              ctx.stroke();

              // Flow path right
              ctx.beginPath();
              ctx.moveTo(coneX + 15, coneY - coneH);
              ctx.lineTo(coneX + 22, coneY - coneH + 25);
              if (flowLen > 35) ctx.lineTo(coneX + 38, coneY - coneH + flowLen * 0.7);
              if (flowLen > 100) ctx.lineTo(coneX + 58, coneY - coneH + flowLen * 1.1);
              ctx.stroke();
              ctx.restore();

              // Spawn physical molten magma particles splashing up
              if (isPlayingRef.current && Math.random() < 0.6 * mult) {
                // Spits particles upwards
                for (let i = 0; i < Math.floor(mult * 2); i++) {
                  spawnParticle(
                    coneX,
                    coneY - coneH - 8,
                    -Math.PI * 0.7, -Math.PI * 0.3,
                    4.0 * speed, 9.0 * speed,
                    2, 5,
                    Math.random() < 0.4 ? "#ffd700" : "#ff4500"
                  );
                }
              }

              // Realistic volcanic background thunderbolts
              if (isPlayingRef.current && mult >= 0.9 && Math.random() < 0.02) {
                ctx.strokeStyle = "#80b0ff";
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(coneX + (Math.random() - 0.5) * 180, coneY - coneH - 120);
                ctx.lineTo(coneX + (Math.random() - 0.5) * 80, coneY - coneH - 50);
                ctx.stroke();
              }
            }

            // Draw black ash covered ground base
            ctx.fillStyle = "#0c0a09";
            ctx.fillRect(0, coneY, width, height - coneY);
          }
          break;
        }

        case "tsunami": {
          // TSUNAMI WAVE VISUALIZATION
          const groundY = height * 0.8;
          const shorelineX = width * 0.6;

          if (isCartoon) {
            // CARTOON TSUNAMI
            // Ocean background
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, 0, width, groundY);

            // Dynamic coastal landscape
            ctx.fillStyle = "#d97706"; // sand ground
            ctx.beginPath();
            ctx.moveTo(shorelineX, groundY);
            ctx.lineTo(width, groundY - 40);
            ctx.lineTo(width, height);
            ctx.lineTo(shorelineX, height);
            ctx.closePath();
            ctx.fill();

            // Palm trees
            ctx.save();
            ctx.translate(width * 0.8, groundY - 20);
            // sway based on time
            const sway = Math.sin(t * 3) * 0.15;
            ctx.rotate(sway);
            ctx.fillStyle = "#78350f"; // trunk
            ctx.fillRect(-4, -40, 8, 40);
            ctx.fillStyle = "#16a34a"; // leaves
            ctx.beginPath();
            ctx.arc(-15, -45, 12, 0, Math.PI * 2);
            ctx.arc(15, -45, 12, 0, Math.PI * 2);
            ctx.arc(0, -55, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Massive tsunami surge wave rolling left to right
            ctx.fillStyle = "#0284c7"; // light cyan wave block
            const waveX = (t / 10.0) * width * 1.3 - 100;
            const waveHeight = 35 * mult;

            ctx.beginPath();
            ctx.moveTo(0, groundY + 100);
            ctx.lineTo(waveX, groundY + 100);
            ctx.quadraticCurveTo(waveX + 30, groundY - waveHeight * 1.2, waveX + 55, groundY - waveHeight);
            ctx.quadraticCurveTo(waveX + 70, groundY - waveHeight * 1.5, waveX + 80, groundY - waveHeight * 0.4);
            ctx.lineTo(waveX + 80, height);
            ctx.lineTo(0, height);
            ctx.closePath();
            ctx.fill();

            // White cartoon splash foam bubble
            ctx.fillStyle = "#fafafa";
            ctx.beginPath();
            ctx.arc(waveX + 75, groundY - waveHeight + 10, 15, 0, Math.PI * 2);
            ctx.arc(waveX + 60, groundY - waveHeight * 1.2, 10, 0, Math.PI * 2);
            ctx.fill();

          } else {
            // REALISTIC TSUNAMI: Dark deep translucent marine shaders, dense foam particles
            const skyB = ctx.createLinearGradient(0, 0, 0, groundY);
            skyB.addColorStop(0, "#080b11");
            skyB.addColorStop(1, "#1a2436");
            ctx.fillStyle = skyB;
            ctx.fillRect(0, 0, width, height);

            // Coastal sand reef slope
            ctx.fillStyle = "#3c2f25";
            ctx.beginPath();
            ctx.moveTo(width * 0.4, groundY);
            ctx.lineTo(width, groundY - 60);
            ctx.lineTo(width, height);
            ctx.lineTo(width * 0.4, height);
            ctx.closePath();
            ctx.fill();

            // Realistic wave mesh calculation
            // Water recedes first (t < 2s) and then floods in (t > 2.5s)
            let waterLevelOffset = 0;
            let wavePosition = 0;
            
            if (t < 2.5) {
              // water line recedes
              waterLevelOffset = - (t * 18);
              wavePosition = -100;
            } else {
              // Surge rolls forward
              waterLevelOffset = (t - 2.5) * 22 * mult;
              wavePosition = (t - 2.5) / 7.5 * width * 1.4 - 50;
            }

            // Render background water body
            const oceanGrad = ctx.createLinearGradient(0, groundY + waterLevelOffset, 0, height);
            oceanGrad.addColorStop(0, "rgba(8, 76, 118, 0.8)");
            oceanGrad.addColorStop(1, "rgba(2, 28, 48, 0.98)");
            ctx.fillStyle = oceanGrad;
            ctx.fillRect(0, groundY + waterLevelOffset, width * 0.4, height - (groundY + waterLevelOffset));

            // Giant rolling tsunami wave crest
            if (wavePosition > -40) {
              ctx.save();
              ctx.fillStyle = oceanGrad;
              ctx.beginPath();
              ctx.moveTo(0, height);
              ctx.lineTo(0, groundY + 120);
              
              // Wave curve shape
              ctx.quadraticCurveTo(wavePosition * 0.7, groundY - 50 * mult, wavePosition, groundY - 80 * mult);
              ctx.bezierCurveTo(wavePosition + 25, groundY - 110 * mult, wavePosition + 50, groundY - 30 * mult, wavePosition + 45, groundY + 50);
              ctx.lineTo(wavePosition + 45, height);
              ctx.closePath();
              ctx.fill();

              // Spawn heavy foam spraying particles
              if (isPlayingRef.current) {
                for (let i = 0; i < Math.floor(mult * 4); i++) {
                  spawnParticle(
                    wavePosition + 15 + Math.random() * 20,
                    groundY - 80 * mult + Math.random() * 25,
                    -Math.PI * 0.2, Math.PI * 0.2,
                    2.0, 5.0,
                    2, 4,
                    Math.random() < 0.5 ? "rgba(255,255,255,0.8)" : "rgba(100, 200, 255, 0.4)"
                  );
                }
              }
              ctx.restore();
            }
          }
          break;
        }

        case "cyclone": {
          // CYCLONE VISUALIZATION (Top Down or cross-section perspective)
          const centerX = width / 2;
          const centerY = height / 2;

          if (isCartoon) {
            // CARTOON CYCLONE
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, width, height);

            // Draw a cartoon storm spinning eye
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(t * speed * 2.5);

            ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
            ctx.beginPath();
            ctx.arc(0, 0, 110 * mult, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 10;
            // Draw spiral arms
            for (let a = 0; a < 4; a++) {
              ctx.save();
              ctx.rotate((a * Math.PI) / 2);
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(40, -40, 80 * mult, -10);
              ctx.stroke();
              ctx.restore();
            }

            // Storm Eye
            ctx.fillStyle = "#0f172a";
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // Flying cartoon details (like a tiny flying vector shape representing a structural piece or leaf)
            if (t > 1.5) {
              ctx.save();
              ctx.translate(width * 0.7, height * 0.3);
              ctx.rotate(t * 3);
              ctx.fillStyle = "#22c55e"; // leaf green
              ctx.fillRect(-10, -5, 20, 10);
              ctx.restore();
            }

          } else {
            // REAL STATISTICAL CYCLONE: Volumetric dense orbital clouds, intense storm eyes, wind currents
            const darkG = ctx.createRadialGradient(centerX, centerY, 5, centerY, centerY, width / 2);
            darkG.addColorStop(0, "#080d1a");
            darkG.addColorStop(1, "#020306");
            ctx.fillStyle = darkG;
            ctx.fillRect(0, 0, width, height);

            // Orbit particles representing wind-vectors matching playhead
            ctx.save();
            ctx.translate(centerX, centerY);
            
            // Speed depends on category
            const rotAng = t * 1.8 * speed * mult;
            ctx.rotate(rotAng);

            // Draw storm bands layers using gradients
            for (let j = 0; j < 3; j++) {
              const r = (50 + j * 45) * mult;
              const cloudG = ctx.createRadialGradient(0, 0, r - 20, 0, 0, r + 40);
              cloudG.addColorStop(0, "rgba(10, 15, 30, 0)");
              cloudG.addColorStop(0.5, `rgba(148, 163, 184, ${0.12 - j * 0.03})`);
              cloudG.addColorStop(1, "rgba(5, 10, 20, 0)");
              
              ctx.fillStyle = cloudG;
              ctx.beginPath();
              ctx.arc(0, 0, r + 40, 0, Math.PI * 2);
              ctx.fill();
            }

            // Core calm barometric eye
            ctx.fillStyle = "rgba(1, 2, 8, 0.95)";
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            // High volume spiral dust trails
            if (isPlayingRef.current) {
              const angleVal = Math.random() * Math.PI * 2;
              const dist = (30 + Math.random() * 120) * mult;
              spawnParticle(
                Math.cos(angleVal) * dist,
                Math.sin(angleVal) * dist,
                angleVal + Math.PI / 2, angleVal + Math.PI / 2,
                4.5 * speed, 8.0 * speed,
                1, 2,
                Math.random() < 0.5 ? "rgba(255,255,255,0.2)" : "rgba(70, 130, 180, 0.15)"
              );
            }
            ctx.restore();
          }
          break;
        }

        case "tornado": {
          // TORNADO VISUALIZATION
          const centerX = width / 2;
          const groundY = height * 0.85;

          if (isCartoon) {
            // CARTOON TORNADO
            ctx.fillStyle = "#1e293b";
            ctx.fillRect(0, 0, width, height);

            // Draw spinning cartoon cone using stacked ellipses
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 4;
            
            const elapsedFactor = Math.min(t / 8.0, 1.0);
            const funnelH = 140 * elapsedFactor;
            
            for (let hOff = 0; hOff < funnelH; hOff += 15) {
              const ringY = groundY - hOff;
              // Width widens at top
              const ringW = 10 + (hOff * 0.5) * mult;
              // oscillate horizontal position
              const oscX = centerX + Math.sin(t * 8 + hOff * 0.05) * 8;
              
              ctx.fillStyle = "rgba(71, 85, 105, 0.4)";
              ctx.beginPath();
              ctx.ellipse(oscX, ringY, ringW, 8, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.stroke();
            }

            // Ground base draw
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, groundY, width, height - groundY);

          } else {
            // REALISTIC TORNADO: Vortex particle columns, flashing stormy depths
            const skyG = ctx.createLinearGradient(0, 0, 0, groundY);
            skyG.addColorStop(0, "#08090f");
            skyG.addColorStop(1, "#181a24");
            ctx.fillStyle = skyG;
            ctx.fillRect(0, 0, width, height);

            // Draw dark overhead clouds
            ctx.fillStyle = "rgba(30, 41, 59, 0.65)";
            ctx.beginPath();
            ctx.arc(centerX - 100, 40, 80, 0, Math.PI * 2);
            ctx.arc(centerX + 100, 40, 85, 0, Math.PI * 2);
            ctx.arc(centerX, 50, 110, 0, Math.PI * 2);
            ctx.fill();

            // Tornado funnel spinning simulation
            if (t > 1.0) {
              ctx.save();
              const density = Math.min((t - 1.0) * 15, 80) * mult;
              
              // Draw a sequence of stacked fuzzy rings to form the visual cone body
              for (let d = 0; d < density; d += 3) {
                const ringY = groundY - (d * 1.6);
                const ringW = (5 + d * 0.42) * mult;
                const windOsc = centerX + Math.sin(t * 14 + d * 0.04) * (12 * mult);

                const ringG = ctx.createRadialGradient(windOsc, ringY, 1, windOsc, ringY, ringW + 5);
                ringG.addColorStop(0, `rgba(71, 85, 105, ${0.45 * mult})`);
                ringG.addColorStop(0.5, `rgba(47, 55, 69, ${0.28 * mult})`);
                ringG.addColorStop(1, "rgba(24, 24, 30, 0)");

                ctx.fillStyle = ringG;
                ctx.beginPath();
                ctx.ellipse(windOsc, ringY, ringW + 10, 8 + d * 0.04, 0, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.restore();

              // Spawn realistic ground dust and debris orbiting the base
              if (isPlayingRef.current) {
                for (let i = 0; i < Math.floor(mult * 3); i++) {
                  const orbitRadius = (20 + Math.random() * 60) * mult;
                  const angle = Math.random() * Math.PI * 2;
                  spawnParticle(
                    centerX + Math.cos(angle) * orbitRadius,
                    groundY + (Math.random() - 0.5) * 8,
                    -Math.PI, -Math.PI / 2,
                    2.0 * speed, 6.0 * speed,
                    1, 3,
                    Math.random() < 0.4 ? "#a1a1aa" : "#475569"
                  );
                }
              }
            }

            // Real debris ground line
            ctx.fillStyle = "#0c0d12";
            ctx.fillRect(0, groundY, width, height - groundY);
          }
          break;
        }

        case "flood": {
          // FLOOD INUNDATION VISUALIZATION
          const groundY = height * 0.8;

          if (isCartoon) {
            // CARTOON FLASH FLOOD
            // Draw sky with simple rain particles
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(0, 0, width, height);

            // Submerged brick house
            ctx.fillStyle = "#b91c1c";
            ctx.fillRect(width * 0.3, groundY - 40, 60, 40);
            ctx.fillStyle = "#451a03"; // roof
            ctx.beginPath();
            ctx.moveTo(width * 0.3 - 5, groundY - 40);
            ctx.lineTo(width * 0.3 + 30, groundY - 60);
            ctx.lineTo(width * 0.3 + 65, groundY - 40);
            ctx.closePath();
            ctx.fill();

            // Rising solid cartoon water layer
            const maxWaterRise = 50 * mult;
            const currentWaterY = groundY - (t / 10.0) * maxWaterRise;
            
            ctx.fillStyle = "rgba(14, 165, 233, 0.75)"; // sky blue translucent
            ctx.fillRect(0, currentWaterY, width, height - currentWaterY);

            // Simple cartoon rain lines
            if (isPlayingRef.current) {
              ctx.strokeStyle = "rgba(186, 230, 253, 0.4)";
              ctx.lineWidth = 2;
              for (let r = 0; r < 6; r++) {
                const rx = (r * 110 + t * 40) % width;
                ctx.beginPath();
                ctx.moveTo(rx, 20);
                ctx.lineTo(rx - 10, 60);
                ctx.stroke();
              }
            }

          } else {
            // REALISTIC FLASH FLOOD: Water waves blending shaders, rain droplets
            const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
            skyGrad.addColorStop(0, "#010205");
            skyGrad.addColorStop(1, "#12141c");
            ctx.fillStyle = skyGrad;
            ctx.fillRect(0, 0, width, height);

            // Structural rebar poles slightly sinking
            ctx.fillStyle = "#27272a";
            ctx.fillRect(width * 0.65, groundY - 80, 8, 80);

            // Sinking details
            const waterRise = (t / 10.0) * 85 * mult;
            const waterSurfaceY = groundY - waterRise;

            // Draw ocean-like depth water blend
            const waterGrad = ctx.createLinearGradient(0, waterSurfaceY, 0, height);
            waterGrad.addColorStop(0, "rgba(30, 58, 138, 0.75)"); // deep blue translucent
            waterGrad.addColorStop(1, "rgba(8, 15, 30, 0.98)");
            ctx.fillStyle = waterGrad;

            // Give wave dynamics to water surface
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(0, waterSurfaceY);
            for (let x = 0; x <= width; x += 15) {
              const waveH = Math.sin(x * 0.05 + t * 4 * speed) * 3 * mult;
              ctx.lineTo(x, waterSurfaceY + waveH);
            }
            ctx.lineTo(width, height);
            ctx.closePath();
            ctx.fill();

            // Particles for heavy pouring rain splashes
            if (isPlayingRef.current) {
              for (let i = 0; i < Math.floor(mult * 2); i++) {
                spawnParticle(
                  Math.random() * width,
                  waterSurfaceY - Math.random() * 5,
                  Math.PI/2, Math.PI/2 + 0.1,
                  4, 8,
                  1, 2,
                  "rgba(100, 200, 255, 0.4)"
                );
              }
            }
          }
          break;
        }
      }

      // Render Active Particles Lifecycle
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02; // particles fade
        if (p.rot !== undefined && p.rotSpeed !== undefined) {
          p.rot += p.rotSpeed;
        }

        if (p.life > 0) {
          ctx.save();
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
      // Clean dead particles
      particles = particles.filter(p => p.life > 0);

      // Render watermarked playhead duration watermark on top in monospace for a high-end simulation design
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
      ctx.fillText(`SIMUL STATE: PLAYING - TIMECODE: ${t.toFixed(2)}s`, 20, 30);
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText(`STYLE: ${visualStyle.toUpperCase()} - ACCEL: ${mult.toFixed(2)}x`, 20, 50);

      localAnimationFrame = requestAnimationFrame(draw);
    };

    localAnimationFrame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(localAnimationFrame);
    };
  }, [simResult, profile, visualStyle]);

  // SVG customized Line and Area chart generator to represent disaster telemetry points perfectly
  const renderInteractiveChart = () => {
    if (!simResult || !simResult.graphData) return null;
    const data = simResult.graphData;
    const maxVal = Math.max(...data.map(d => d.metricVal), 1.0);
    const maxSec = Math.max(...data.map(d => d.metricSecondary), 1.0);

    // Grid coordinates
    const chartWidth = 550;
    const chartHeight = 110;
    const padding = { left: 40, right: 40, top: 10, bottom: 20 };
    
    const scaleX = (val: number) => padding.left + (val / 10.0) * (chartWidth - padding.left - padding.right);
    const scaleY1 = (val: number) => chartHeight - padding.bottom - (val / maxVal) * (chartHeight - padding.top - padding.bottom);
    const scaleY2 = (val: number) => chartHeight - padding.bottom - (val / maxSec) * (chartHeight - padding.top - padding.bottom);

    // Build SVG path strings
    let pathD1 = "";
    let areaD1 = "";
    let pathD2 = "";

    data.forEach((pt, i) => {
      const x = scaleX(pt.time);
      const y1 = scaleY1(pt.metricVal);
      const y2 = scaleY2(pt.metricSecondary);

      if (i === 0) {
        pathD1 = `M ${x} ${y1}`;
        areaD1 = `M ${x} ${chartHeight - padding.bottom} L ${x} ${y1}`;
        pathD2 = `M ${x} ${y2}`;
      } else {
        pathD1 += ` L ${x} ${y1}`;
        pathD2 += ` L ${x} ${y2}`;
        areaD1 += ` L ${x} ${y1}`;
      }
      
      if (i === data.length - 1) {
        areaD1 += ` L ${x} ${chartHeight - padding.bottom} Z`;
      }
    });

    const activePlayX = scaleX(currentTime);

    return (
      <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-slate-200 tracking-wide">Continuous Time Telemetry Curve (0 - 10 s)</span>
          </div>
          <div className="flex gap-4 text-[10px] font-mono">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: profile.accentColor }} />
              {simResult.metricLabel || "Primary"}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full inline-block bg-slate-400" />
              {simResult.secondaryLabel || "Secondary"}
            </span>
          </div>
        </div>

        {/* Dynamic Responsive SVG plot */}
        <div className="relative w-full">
          <svg className="w-full h-[120px] overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`grad-${profile.type}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={profile.accentColor} stopOpacity="0.25" />
                <stop offset="100%" stopColor={profile.accentColor} stopOpacity="0.00" />
              </linearGradient>
            </defs>

            {/* Grid dotted lines */}
            <line x1={scaleX(0)} y1={scaleY1(0)} x2={scaleX(10)} y2={scaleY1(0)} stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />
            <line x1={scaleX(0)} y1={(chartHeight - padding.top - padding.bottom)/2 + padding.top} x2={scaleX(10)} y2={(chartHeight - padding.top - padding.bottom)/2 + padding.top} stroke="rgba(51, 65, 85, 0.3)" strokeDasharray="3 3" />

            {/* Time labels bottom ax */}
            <text x={scaleX(0)} y={chartHeight - 4} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">0.0s</text>
            <text x={scaleX(2.5)} y={chartHeight - 4} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">2.5s</text>
            <text x={scaleX(5.0)} y={chartHeight - 4} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">5.0s</text>
            <text x={scaleX(7.5)} y={chartHeight - 4} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">7.5s</text>
            <text x={scaleX(10.0)} y={chartHeight - 4} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">10.0s</text>

            {/* Area gradient under primary line */}
            <path d={areaD1} fill={`url(#grad-${profile.type})`} />

            {/* Line Plots */}
            <path d={pathD1} fill="none" stroke={profile.accentColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD2} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />

            {/* Vertical Marker sync with current video playhead */}
            <line 
              x1={activePlayX} 
              y1={padding.top} 
              x2={activePlayX} 
              y2={chartHeight - padding.bottom} 
              stroke="#22c55e" 
              strokeWidth="2" 
              className="transition-all"
            />
            {/* Playhead pulsing dot indicator */}
            {isPlaying && (
              <circle 
                cx={activePlayX} 
                cy={scaleY1(data[Math.min(Math.floor(currentTime), data.length-1)]?.metricVal || 0)} 
                r="4.5" 
                fill="#22c55e" 
                className="animate-ping" 
              />
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div id={`sim-lab-${profile.type}`} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back to Home portal */}
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-slate-300 hover:text-white rounded-lg border border-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Disaster Hub
        </button>
        <div className="flex items-center gap-2 text-xs font-mono bg-emerald-950/40 text-emerald-400 border border-emerald-900 px-3 py-1 rounded-full">
          <Cpu className="h-3.5 w-3.5 animate-spin" />
          <span>Simulation Mode: Ready</span>
        </div>
      </div>

      {/* Header Profile Title and scientific Description */}
      <div className="mb-8 p-6 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-start gap-4 flex-col md:flex-row justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs uppercase font-mono px-2.5 py-0.5 bg-slate-900 rounded border border-slate-850" style={{ color: profile.accentColor }}>
              Research Phase
            </span>
            <span className="text-slate-500 text-xs font-mono">/ Physical Dynamics Lab</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-3">
            {profile.title} Visualization Lab
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {profile.scientificIntro}
          </p>
        </div>
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 self-stretch md:self-auto flex flex-col justify-center">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block mb-1">Acoustic Tone</span>
          <span className="text-xs text-white flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            {profile.soundDescription}
          </span>
        </div>
      </div>

      {/* Control Block with Style Toggles & Magnitude selection */}
      <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 overflow-visible">
        {/* Visual representation button group (MUST be displayed at top right corner of selector widget) */}
        <div className="sm:absolute sm:top-5 sm:right-6 mb-4 sm:mb-0 flex items-center justify-between z-10">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-850">
            <button
              onClick={() => { setVisualStyle("cartoon"); }}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                visualStyle === "cartoon"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              No. 1 Cartoonish Drawing
            </button>
            <button
              onClick={() => { setVisualStyle("realistic"); }}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                visualStyle === "realistic"
                  ? "bg-slate-800 text-white border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              No. 2 Real Visual Type
            </button>
          </div>
        </div>

        {/* Parameter search select labels */}
        <div>
          <label className="text-sm font-bold text-slate-300 block mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-slate-400" />
            Step 1: Select {profile.parameterName} to Visualize ({profile.unitLabel})
          </label>

          {/* Search / Filter and Custom Value inputs with Real-time Validations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* Search filter column */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider block mb-2">Search Level Options</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Filter options e.g. "Cat 3" or ">30m"...`}
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className={`w-full px-3 py-2 text-xs bg-slate-950 text-slate-100 border rounded-lg focus:outline-none placeholder-slate-600 transition-colors ${
                    searchError ? "border-rose-500 focus:border-rose-600" : "border-slate-800"
                  }`}
                />
                {searchQuery && (
                  <button 
                    onClick={() => handleSearchChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono"
                  >
                    CLEAR
                  </button>
                )}
              </div>
              {searchError && (
                <p className="text-[11px] text-rose-500 mt-2 flex items-center gap-1 font-sans">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                  {searchError}
                </p>
              )}
            </div>

            {/* Custom magnitude input column */}
            <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-850">
              <span className="text-[10px] text-slate-500 font-mono uppercase font-bold tracking-wider block mb-2">Or Enter Custom Numeric {profile.parameterName}</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`E.g. ${getExampleValue(profile.type)}`}
                  value={customMagnitude}
                  onChange={(e) => handleCustomMagnitudeChange(e.target.value)}
                  className={`flex-1 px-3 py-2 text-xs bg-slate-950 text-slate-100 border rounded-lg focus:outline-none placeholder-slate-600 transition-colors ${
                    customError ? "border-rose-500 focus:border-rose-500" : "border-slate-800"
                  }`}
                />
                <button
                  onClick={handleApplyCustomMagnitude}
                  disabled={!!customError || !customMagnitude.trim()}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all duration-150 ${
                    customError || !customMagnitude.trim()
                      ? "bg-slate-900 border border-slate-850 text-slate-500 cursor-not-allowed"
                      : "bg-emerald-650 hover:bg-emerald-600 border border-emerald-505 hover:border-emerald-400 text-white shadow"
                  }`}
                >
                  APPLY
                </button>
              </div>
              {customError ? (
                <p className="text-[11px] text-rose-500 mt-2 flex items-center gap-1 font-sans">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500 flex-shrink-0" />
                  {customError}
                </p>
              ) : (
                <p className="text-[10px] text-slate-500 font-mono mt-2">
                  Inputs are strictly type-validated for numeric safety to protect downstream telemetry.
                </p>
              )}
            </div>
          </div>

          {/* Preset options mapped (filtered by search query) */}
          <div className="flex flex-wrap gap-2.5">
            {profile.options
              .filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelectedOption(opt)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all duration-200 ${
                    selectedOption === opt
                      ? "bg-white text-slate-950 border-white shadow-lg"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {opt}
                </button>
              ))}
          </div>

          <p className="text-[10px] text-slate-500 font-mono mt-3">
            Every dynamic selection compiles automated vector calculations and updates physical constants on-screen.
          </p>
        </div>
      </div>

      {/* Main Grid: Left is Video simulation, Right is Description summary table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Generate / Video animation sequence box */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="relative aspect-video w-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden group shadow-2xl flex flex-col justify-end">
            
            {/* HTML5 Canvas Simulation Screen */}
            <canvas 
              ref={canvasRef} 
              width={640} 
              height={360} 
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Rendering AI state loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center transition-all">
                <div className="relative mb-4">
                  <div className="h-12 w-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  <Sparkles className="h-5 w-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <h4 className="text-white text-sm font-bold tracking-tight mb-2 flex items-center gap-1.5 justify-center">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  AI Agent Compiling Physics parameters...
                </h4>
                <div className="max-w-md bg-slate-900 border border-slate-800 p-3 rounded-lg text-[10px] font-mono text-left space-y-1 select-none">
                  <p className="text-emerald-400 animate-pulse">⚡ calling Models/Gemini-3.5-Flash server side...</p>
                  <p className="text-slate-500">→ parsing seismic boundaries and sound density...</p>
                  <p className="text-slate-500">→ loading 10-second structural displacement vector scale...</p>
                </div>
              </div>
            )}

            {/* Play overlay button if paused & not finished */}
            {!isPlaying && currentTime < 10.0 && !isLoading && (
              <div 
                onClick={handleTogglePlay}
                className="absolute inset-0 bg-slate-950/20 hover:bg-slate-950/45 cursor-pointer flex items-center justify-center transition-colors group"
                id="play-overlay"
              >
                <div className="p-4 bg-white/10 hover:bg-white/15 text-white backdrop-blur-md rounded-full border border-white/20 scale-100 group-hover:scale-110 shadow-xl transition-all duration-300">
                  <Play className="h-10 w-10 fill-white" />
                </div>
              </div>
            )}

            {/* Playback video controller bar at bottom of video generated */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 z-20">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleTogglePlay}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg border border-slate-800 transition-colors"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors"
                  title="Reset playhead"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>

                {/* Progress bar representing 10 seconds of video animation */}
                <div className="flex-1 relative py-2">
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all rounded-full"
                      style={{ width: `${(currentTime / 10.0) * 100}%` }}
                    />
                  </div>
                  {/* Sliding cursor marker */}
                  <div 
                    className="absolute top-1/2 -mt-1.5 h-3 w-3 rounded-full bg-white border-2 border-emerald-500 cursor-pointer shadow transition-all"
                    style={{ left: `calc(${(currentTime / 10.0) * 100}% - 6px)` }}
                  />
                </div>

                <div className="text-xs text-slate-300 font-mono flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>{currentTime.toFixed(1)}s / 10.0s</span>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC TELEMETRY GRAPH - "display at just beneath the video generated" */}
          {renderInteractiveChart()}

          {/* Real-time system console feedback */}
          <div className="bg-slate-950 border border-slate-880 rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed space-y-1 max-h-[140px] overflow-y-auto">
            <span className="text-slate-500 font-semibold uppercase block tracking-wider text-[9px] mb-2">Live Telementry Logs</span>
            {consoleLogs.map((log, i) => (
              <p key={i} className="font-mono text-slate-400">
                <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
              </p>
            ))}
          </div>
        </div>

        {/* DESCRIPTION SUMMARY TABLE - "be placed at right beside the video generated" */}
        <div id="sim-info-sidebar" className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-lg border border-slate-850 mb-6">
                {simResult?.aiGenerated ? (
                  <>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs font-bold text-amber-400 tracking-wide">Dynamic AI generated</span>
                  </>
                ) : (
                  <>
                    <Cpu className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-bold text-emerald-400 tracking-wide">Physically Modeled</span>
                  </>
                )}
              </div>

              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
                Disaster Profile Summary
              </h4>

              <div className="border-t border-b border-slate-800 py-4 mb-4 select-text">
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-slate-850">
                      <td className="py-2 text-slate-500 font-mono">Phenomenon</td>
                      <td className="py-2 text-white font-bold text-right">{profile.title}</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="py-2 text-slate-500 font-mono">Intensity Selected</td>
                      <td className="py-2 text-emerald-400 font-black text-right">{selectedOption}</td>
                    </tr>
                    <tr className="border-b border-slate-850">
                      <td className="py-2 text-slate-500 font-mono">Acoustic Load</td>
                      <td className="py-2 text-white font-semibold text-right flex items-center justify-end gap-1">
                        <Volume2 className="h-3 w-3 text-red-400" />
                        {simResult?.decibel.split(" - ")[0] || "80 dB"}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-500 font-mono">Style Mode</td>
                      <td className="py-2 text-emerald-400 font-mono text-right capitalize">{visualStyle} Type</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary description paragraph */}
              <div className="bg-slate-950 border border-slate-950 p-4 rounded-xl mb-6">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-2">Scientific Diagnosis</span>
                <p className="text-xs text-slate-300 leading-relaxed select-text">
                  {simResult ? simResult.summary : "Compiling local geometric structures and boundary conditions..."}
                </p>
              </div>

              {/* Precautions lists */}
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                <span className="text-[10px] uppercase font-bold tracking-wider text-red-400 flex items-center gap-1.5 mb-3">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-400 animate-pulse" />
                  CRITICAL PRECAUTIONS FOR {selectedOption.toUpperCase()}
                </span>
                <ul className="space-y-2.5 text-xs text-slate-300">
                  {simResult ? (
                    simResult.precautions.map((prec, i) => (
                      <li key={i} className="flex items-start gap-2 select-text">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
                        <span>{prec}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500 animate-pulse">Compiling hazard directives...</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
              <span>TerraForce Engine v2.5</span>
              <span>UTC Localized</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
