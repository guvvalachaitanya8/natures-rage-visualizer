import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: [
      "https://natures-rage-visualizer.vercel.app",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  })
);

app.options("*", cors());

app.use(express.json());

// In-memory persistence for comments & requests (feedback)
interface Feedback {
  id: string;
  timestamp: string;
  username: string;
  email: string;
  comment: string;
  requestUpdate: string;
  disasterReference?: string;
  rating: number;
}

const FEEDBACK_STORE_FILE = path.join(process.cwd(), "feedback_store.json");

function getFeedbackList(): Feedback[] {
  try {
    if (fs.existsSync(FEEDBACK_STORE_FILE)) {
      const data = fs.readFileSync(FEEDBACK_STORE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading feedback file, using empty array", err);
  }
  return [
    {
      id: "1",
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
      username: "Dr. Elena Rostova",
      email: "elena@seismo.org",
      comment: "The visual distinction between Cartoonish and Real physical rendering is extraordinary. It makes teaching complex wave frequencies extremely interactive!",
      requestUpdate: "Would love to see tectonic plate selection (convergent vs. divergent) in the Earthquake module.",
      disasterReference: "Earthquakes",
      rating: 5
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      username: "Kai Jenkins",
      email: "kai.j@meteo.edu",
      comment: "Excellent simulation of Cyclone cloud spirals! The wind scale maps perfectly to Saffir-Simpson levels.",
      requestUpdate: "Add storm surge calculations based on coordinate barometric pressures in the next iteration.",
      disasterReference: "Cyclones",
      rating: 4
    }
  ];
}

function saveFeedback(feedback: Feedback) {
  try {
    const list = getFeedbackList();
    list.unshift(feedback); // Add to beginning
    fs.writeFileSync(FEEDBACK_STORE_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving feedback:", err);
  }
}

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      try {
        aiClient = new GoogleGenAI({
          apiKey: apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build",
            },
          },
        });
        console.log("Gemini API Client initialized successfully.");
      } catch (e) {
        console.error("Failed to initialize Gemini API client:", e);
      }
    } else {
      console.warn("GEMINI_API_KEY is not defined or is a placeholder. Falling back to local procedural simulation values.");
    }
  }
  return aiClient;
}

// Local simulation fallback generator in case API key is missing or fails
function getProceduralSimulation(disasterType: string, intensity: string, style: string) {
  console.log(`Generating procedural simulation for ${disasterType} [${intensity}] (${style})`);
  const isCartoon = style === "cartoon";
  
  let decibel = "80 dB - Loud motor noise";
  let summary = `Procedural analysis of ${disasterType} at ${intensity}. This is a simulated preview representing scientific research models.`;
  let precautions: string[] = ["Stay clear of high-hazard zones", "Follow local authority emergency broadcasts"];
  let metricLabel = "Intensity Value";
  let secondaryLabel = "Energy Release Scale";
  
  let graphPointsCount = 10;
  let graphData: any[] = [];
  
  // Custom config depending on disasters
  let simulationConfig = {
    intensityMultiplier: 1.0,
    speedFactor: 1.0,
    colorTheme: "#ff3300",
    customLabel: intensity
  };

  switch (disasterType.toLowerCase()) {
    case "earthquake":
      decibel = intensity.includes("1-2") ? "20 dB - Barely perceptible hum" :
                intensity.includes("3-4") ? "50 dB - Moderate vibrational wall rattling" :
                intensity.includes("5-6") ? "85 dB - Heavy rumble, collapsing brick frequencies" :
                intensity.includes("7-8") ? "115 dB - Extremely deafening ground shearing sound" :
                                            "130 dB - Violent subsonic subterranean roaring";
      summary = `An earthquake at ${intensity} triggers powerful seismic shear forces that travel through the crust. The primary waves compress the crust, while secondary waves cause severe structural displacement. Under a ${style} representation, the physical deformation focuses on ${isCartoon ? "simplified structural offsets and bold comic ripple lines" : "high-fidelity ground fractures, realistic dust cloud particle interactions, and structural mass-spring damper physics calculation."}`;
      precautions = [
        "Drop, Cover, and Hold On beneath structurally verified tables or desks.",
        "Stay away from masonry walls, windows, outer glass envelopes, and suspended decorative structures.",
        "If outdoors, seek a clear open space immediately away from overhead high-voltage lines, streetlamps, and concrete arches."
      ];
      metricLabel = "Seismic Accel (m/s²)";
      secondaryLabel = "Frictional Resistance (%)";
      simulationConfig = {
        intensityMultiplier: intensity.includes("1-2") ? 0.15 : intensity.includes("3-4") ? 0.4 : intensity.includes("5-6") ? 0.75 : intensity.includes("7-8") ? 1.2 : 1.8,
        speedFactor: intensity.includes("1-2") ? 0.5 : intensity.includes("3-4") ? 0.8 : intensity.includes("5-6") ? 1.1 : intensity.includes("7-8") ? 1.4 : 1.7,
        colorTheme: isCartoon ? "#e2a93c" : "#8c6239",
        customLabel: `Richter Magnitude ${intensity}`
      };
      break;

    case "volcano":
      decibel = intensity.includes("Cool") ? "10 dB - Gentle geothermal steam vents" :
                intensity.includes("600-800") ? "75 dB - Viscous flow cracking and bubbling" :
                intensity.includes("800-1000") ? "100 dB - Moderate explosive gas detonations" :
                intensity.includes("1000-1200") ? "125 dB - Thunderous pyroclastic supersonic shockwaves" :
                                                 "140 dB - Continuous eruptive crackling, rocket-launch level roar";
      summary = `At temperatures of ${intensity}, the viscosity of silica-rich magma changes dramatically. Viscous block-lava is characterized by high gas friction, causing explosive volcanic lightning, massive gray ash plume dispersion, and fast-flowing pyroclastic density currents destroying flora.`;
      precautions = [
        "Immediately evacuate all designated exclusion areas within the hazard radius.",
        "Wear high-grade positive pressure masks (e.g., N95/N100 respirators) and complete eye goggles to filter fine silica-glass ash.",
        "Avoid low river valleys and drainage channels due to rapid torrential volcanic mudflow (lahar) hazards."
      ];
      metricLabel = "Magma Chamber Pressure (MPa)";
      secondaryLabel = "Eruption Gas Yield (m³/s)";
      simulationConfig = {
        intensityMultiplier: intensity.includes("Cool") ? 0.05 : intensity.includes("600-800") ? 0.35 : intensity.includes("800-1000") ? 0.65 : intensity.includes("1000-1200") ? 1.0 : 1.6,
        speedFactor: intensity.includes("Cool") ? 0.2 : intensity.includes("600-800") ? 0.6 : intensity.includes("800-1000") ? 0.9 : intensity.includes("1000-1200") ? 1.3 : 1.8,
        colorTheme: intensity.includes("Cool") ? "#a1a1aa" : intensity.includes("600-800") ? "#ea580c" : "#ff2200",
        customLabel: `Thermal State: ${intensity}`
      };
      break;

    case "tsunami":
      decibel = intensity.includes("1-2m") ? "45 dB - Coastal tide hiss" :
                intensity.includes("3-5m") ? "70 dB - Crashing heavy surf" :
                intensity.includes("10-15m") ? "95 dB - Low freight train roaring" :
                intensity.includes("20-30m") ? "118 dB - Thunderous sea impact screech" :
                                                "135 dB - Earth-shaking hydraulic hammer compression sound";
      summary = `The displacement of water creates a wave height of ${intensity}. As the wave approaches shallow water, the wave shoaling effect forces the kinetic energy upward, converting speed to height. The resulting wall of hydrodynamic force breaks structural foundations.`;
      precautions = [
        "Head immediately inland to verified high-elevation natural terrain or designated vertical evacuation towers.",
        "Never stay near beaches or low estuaries to watch a returning wave; water receding radically is a sudden warning.",
        "Remain in safe shelter until official municipal scientific warning signals are completely deactivated."
      ];
      metricLabel = "Hydrodynamic Force (kN/m²)";
      secondaryLabel = "Inland Inundation Distance (m)";
      simulationConfig = {
        intensityMultiplier: intensity.includes("1-2m") ? 0.15 : intensity.includes("3-5m") ? 0.35 : intensity.includes("10-15m") ? 0.7 : intensity.includes("20-30m") ? 1.1 : 1.7,
        speedFactor: intensity.includes("1-2m") ? 0.4 : intensity.includes("3-5m") ? 0.7 : intensity.includes("10-15m") ? 1.0 : intensity.includes("20-30m") ? 1.3 : 1.6,
        colorTheme: isCartoon ? "#38bdf8" : "#0c4a6e",
        customLabel: `Tsunami wave crest height: ${intensity}`
      };
      break;

    case "cyclone":
      decibel = intensity.includes("Cat 1") ? "80 dB - Gales and roaring trees" :
                intensity.includes("Cat 2") ? "95 dB - Whistling structural wind fatigue" :
                intensity.includes("Cat 3") ? "110 dB - Deafening roof peeling and impact hum" :
                intensity.includes("Cat 4") ? "125 dB - Jet engine roar, flying structural debris" :
                                              "140 dB - Apocalyptic wind screaming, total sensory isolation";
      summary = `A Cyclone at ${intensity} creates an immense circular storm system. Coriolis force drives warm convective moisture into a tight rotating wall of devastating kinetic pressure. Under a ${style} presentation, the cyclone is characterized by ${isCartoon ? "clean spiral cartoon sweeps, spinning cows, and circular high-contrast storm eyes" : "dense orbital wind-vector particle clouds, dark volumetric overlay shades, and dramatic turbulence noise curves."}`;
      precautions = [
        "Seek immediate shelter in a certified, impact-resistant storm room or central windowless concrete corridor.",
        "Ensure all impact-resistant exterior protective storm shutters are fully closed and bolted down.",
        "Prepare emergency rations, batteries, clean water reserves, and fully charged radio communications."
      ];
      metricLabel = "Max Sustained Winds (km/h)";
      secondaryLabel = "Atmospheric Pressure (hPa)";
      simulationConfig = {
        intensityMultiplier: intensity.includes("Cat 1") ? 0.25 : intensity.includes("Cat 2") ? 0.5 : intensity.includes("Cat 3") ? 0.75 : intensity.includes("Cat 4") ? 1.1 : 1.6,
        speedFactor: intensity.includes("Cat 1") ? 0.5 : intensity.includes("Cat 2") ? 0.8 : intensity.includes("Cat 3") ? 1.1 : intensity.includes("Cat 4") ? 1.4 : 1.8,
        colorTheme: isCartoon ? "#94a3b8" : "#334155",
        customLabel: `Saffir-Simpson ${intensity}`
      };
      break;

    case "tornado":
      decibel = intensity.includes("EF0") ? "75 dB - Moderate wind whistle" :
                intensity.includes("EF1") ? "90 dB - Deep wind rustling and thuds" :
                intensity.includes("EF2") ? "105 dB - Ripping structural wind howling" :
                intensity.includes("EF3") ? "120 dB - Freight-train roar and breaking trees" :
                intensity.includes("EF4") ? "130 dB - Deafening metal crushing sounds" :
                                            "145 dB - Shockwave-level high-pressure atmospheric scream";
      summary = `The violent vortex of an ${intensity} tornado creates extreme suction force. Warm updrafts encounter vertical wind shear, instigating a horizontal rotating column of moisture and dirt that descends to ground level, destroying wood and concrete alike.`;
      precautions = [
        "Go immediately to an underground storm cellar, basement, or safe interior room on the lowest level.",
        "Protect your head with heavy mattresses, helmets, or thick protective blankets to defend from ballistic debris.",
        "Avoid sheltering inside mobile homes, temporary structures, or underneath concrete bridge highway overpasses."
      ];
      metricLabel = "Funnel Rotational Speed (km/h)";
      secondaryLabel = "Debris Loading Index (%)";
      simulationConfig = {
        intensityMultiplier: intensity.includes("EF0") ? 0.15 : intensity.includes("EF1") ? 0.35 : intensity.includes("EF2") ? 0.6 : intensity.includes("EF3") ? 0.9 : intensity.includes("EF4") ? 1.3 : 1.8,
        speedFactor: intensity.includes("EF0") ? 0.4 : intensity.includes("EF1") ? 0.7 : intensity.includes("EF2") ? 1.0 : intensity.includes("EF3") ? 1.3 : intensity.includes("EF4") ? 1.5 : 1.8,
        colorTheme: isCartoon ? "#cbd5e1" : "#475569",
        customLabel: `Fujita Rating ${intensity}`
      };
      break;

    case "flood":
      decibel = intensity.includes("1-2 ft") ? "40 dB - Shallow gurgling flows" :
                intensity.includes("3-5 ft") ? "65 dB - Rushing muddy current sloshing" :
                intensity.includes("6-10 ft") ? "88 dB - Crushing riverine hydraulic force" :
                                                "110 dB - Deafening torrents of debris-laden rolling water";
      summary = `Accumulating water reaches ${intensity}, overwhelming local stormwater conduits, subways, and buildings. High buoyancy forces easily float heavy sedans, while mud-laden rivers erode roadbed integrity.`;
      precautions = [
        "Never attempt to drive or walk through flooded roadways; just 6 inches of moving water can sweep you away.",
        "If trapped inside a submerged building, escape immediately to high upper floors or the roof surface.",
        "Turn off all primary electrical breakers and utility gas lines to avoid sudden short-circuit electrocution or gas leaks."
      ];
      metricLabel = "Inundation Depth Level (ft)";
      secondaryLabel = "Hydrostatic Uplift Force (kN)";
      simulationConfig = {
        intensityMultiplier: intensity.includes("1-2 ft") ? 0.2 : intensity.includes("3-5 ft") ? 0.5 : intensity.includes("6-10 ft") ? 0.9 : 1.5,
        speedFactor: intensity.includes("1-2 ft") ? 0.5 : intensity.includes("3-5 ft") ? 0.8 : intensity.includes("6-10 ft") ? 1.1 : 1.5,
        colorTheme: isCartoon ? "#38bdf8" : "#1e3a8a",
        customLabel: `Inundation State: ${intensity}`
      };
      break;
  }

  // Generate 10 plausible scientific data-points for high quality dynamic charts
  for (let i = 0; i <= graphPointsCount; i++) {
    const progress = i / graphPointsCount;
    // Base wave or curve + turbulence noise
    let baseVal = 0;
    let baseSec = 0;
    
    const mult = simulationConfig.intensityMultiplier;

    if (disasterType.toLowerCase() === "earthquake") {
      // Seismic waves spike suddenly in middle
      const wave = Math.sin(progress * Math.PI * 8) * Math.sin(progress * Math.PI);
      baseVal = Math.abs(wave) * 12 * mult + (Math.random() * 1.5);
      baseSec = (100 - (baseVal * 4)) + (Math.random() * 5);
      baseSec = Math.max(10, Math.min(100, baseSec));
    } else if (disasterType.toLowerCase() === "volcano") {
      // Thermal builds pressure then releases with temperature spike
      baseVal = (progress * progress * 80 * mult) + (Math.sin(progress * 20) * 4);
      baseSec = Math.max(400, (600 + progress * 700 * mult) + (Math.sin(progress * 15) * 50));
    } else if (disasterType.toLowerCase() === "tsunami") {
      // recedes then massive wave crest
      const wave = progress < 0.3 ? -15 * progress : Math.pow(progress - 0.2, 2.5) * 150 * mult;
      baseVal = wave;
      baseSec = Math.max(0, progress * 400 * mult + (Math.sin(progress * 5) * 20));
    } else if (disasterType.toLowerCase() === "cyclone") {
      // Pressure dips as wind speeds peak
      baseVal = (Math.sin(progress * Math.PI) * 220 * mult) + 50;
      baseSec = 1013 - (Math.sin(progress * Math.PI) * 110 * mult);
    } else if (disasterType.toLowerCase() === "tornado") {
      // Funnel touches down
      const touched = progress > 0.2 && progress < 0.8 ? 1 : 0.1;
      baseVal = touched * (250 * mult) + (Math.random() * 20);
      baseSec = (progress * 100 * mult) * touched;
    } else { // flood
      // Steady accumulation
      baseVal = (progress * 12 * mult) + (Math.sin(progress * 10) * 0.5);
      baseSec = baseVal * 22 * mult;
    }

    graphData.push({
      time: Math.round(progress * 100) / 10, // 0 to 10 seconds
      metricVal: Math.round(baseVal * 10) / 10,
      metricSecondary: Math.round(baseSec * 10) / 10,
    });
  }

  return {
    decibel,
    summary,
    precautions,
    graphData,
    metricLabel,
    secondaryLabel,
    simulationConfig
  };
}

// REST endpoints
app.get("/api/feedback", (req, res) => {
  const list = getFeedbackList();
  res.json({ status: "success", data: list });
});

app.post("/api/feedback", (req, res) => {
  const { username, email, comment, requestUpdate, disasterReference, rating } = req.body;
  if (!username || !comment || !requestUpdate) {
    return res.status(400).json({ status: "error", message: "Username, comment and feature request are required." });
  }

  const newFeedback: Feedback = {
    id: String(Date.now()),
    timestamp: new Date().toISOString(),
    username: String(username).trim(),
    email: String(email || "anonymous@natureforces.org").trim(),
    comment: String(comment).trim(),
    requestUpdate: String(requestUpdate).trim(),
    disasterReference: disasterReference ? String(disasterReference).trim() : undefined,
    rating: Number(rating) || 5
  };

  saveFeedback(newFeedback);
  res.json({ status: "success", data: newFeedback });
});

app.post("/api/simulate", async (req, res) => {
  const { disasterType, intensity, style } = req.body;
  
  if (!disasterType || !intensity || !style) {
    return res.status(400).json({ status: "error", message: "Missing required simulation factors." });
  }

  const ai = getGeminiClient();
  if (!ai) {
    // Return procedural data if no credentials
    const procedural = getProceduralSimulation(disasterType, intensity, style);
    return res.json({ status: "success", aiGenerated: false, ...procedural });
  }

  try {
    const prompt = `You are an elite geological and meteorological AI modeling assistant.
Generate a realistic scientific simulation profile for a natural disaster visualization.
Disaster: ${disasterType}
Intensity level requested by user: ${intensity}
Rendering visual style: ${style} (either "cartoon" or "realistic")

You must respond in strict JSON format matching the following structural schema:
{
  "decibel": "A string describing the measured sound level in decibels at close proximity with a comparison (e.g., '120 dB - equivalent to a freight train locomotive')",
  "summary": "A 3-sentence scientific paragraph detailing the specific physical and mechanical impact of this disaster at this specific intensity and visual styling. Keep it professional, detailed and authoritative.",
  "precautions": ["At least 3 practical safety directives and immediate precautions for this disaster level"],
  "metricLabel": "Brief custom label for primary sensor (e.g., 'Ground Acceleration (g)', 'Tephra Gas Velocity (m/s)', 'Pascals of Wind Shear')",
  "secondaryLabel": "Brief custom label for secondary sensor (e.g., 'Frictional Loss Ratio', 'Seismic Energy Release (PJ)')",
  "graphData": [
    {
      "time": 0.0,
      "metricVal": 10.0,
      "metricSecondary": 22.5
    },
    ...
    Provide exactly 11 data points for times 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 representing physical telemetry values during a 10-second simulation cycle. Ensure the curves look mathematically plausible.
  ],
  "simulationConfig": {
    "intensityMultiplier": 1.5,
    "speedFactor": 1.2,
    "colorTheme": "A hex color code suitable for drawing this disaster theme",
    "customLabel": "A short descriptive label outlining parameters"
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            decibel: { type: Type.STRING },
            summary: { type: Type.STRING },
            precautions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            metricLabel: { type: Type.STRING },
            secondaryLabel: { type: Type.STRING },
            graphData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.NUMBER },
                  metricVal: { type: Type.NUMBER },
                  metricSecondary: { type: Type.NUMBER }
                },
                required: ["time", "metricVal", "metricSecondary"]
              }
            },
            simulationConfig: {
              type: Type.OBJECT,
              properties: {
                intensityMultiplier: { type: Type.NUMBER },
                speedFactor: { type: Type.NUMBER },
                colorTheme: { type: Type.STRING },
                customLabel: { type: Type.STRING }
              },
              required: ["intensityMultiplier", "speedFactor", "colorTheme", "customLabel"]
            }
          },
          required: ["decibel", "summary", "precautions", "metricLabel", "secondaryLabel", "graphData", "simulationConfig"]
        }
      }
    });

    const bodyText = response.text;
    if (bodyText) {
      const data = JSON.parse(bodyText.trim());
      return res.json({ status: "success", aiGenerated: true, ...data });
    } else {
      throw new Error("Empty response from Gemini API");
    }

  } catch (error: any) {
    console.error("Gemini API call failed, falling back to procedural generation:", error);
    const procedural = getProceduralSimulation(disasterType, intensity, style);
    return res.json({ status: "success", aiGenerated: false, ...procedural, error: error.message });
  }
});

// Serve frontend assets and start server in async block to prevent top-level await errors in bundled CJS
async function bootstrapServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server fully operative on port ${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
