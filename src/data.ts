import { DisasterProfile } from "./types";

export const DISASTER_PROFILES: DisasterProfile[] = [
  {
    type: "earthquake",
    title: "Earthquakes",
    shortDescription: "Violent subterranean tremors triggered by tectonic plate slip fractures and tectonic stress releases.",
    scientificIntro: "Earthquakes arise from sudden lithospheric shearing, sending seismic shock waves (P-waves and S-waves) reflecting and refracting through rock structures. High acceleration stresses compromise concrete and clay foundations instantly.",
    parameterName: "Magnitude",
    unitLabel: "Richter scale",
    options: ["1-2 magnitudes", "3-4 magnitudes", "5-6 magnitudes", "7-8 magnitudes", "9+ magnitudes"],
    accentColor: "#f59e0b", // Amber
    glowColor: "rgba(245, 158, 11, 0.15)",
    soundDescription: "Low sub-audible mechanical rumbling and high frequency structural vibrations.",
    imagePrompt: "Tectonic fault fracture cracks deep and dusty, golden dramatic sunset highlighting earthy cracked layers, scientific layout sketch overlay."
  },
  {
    type: "volcano",
    title: "Volcano Eruption",
    shortDescription: "Subterranean pressure shifts fluid magma up the crust conduit, spitting viscous boiling flows.",
    scientificIntro: "Volcanic eruptions are explosive geothermal releases driven by ascending silica gases. Magma density decreases under tectonic decompression, driving lava venting, pyroclastic ash clouds, and viscous lava flows.",
    parameterName: "Temperature Range",
    unitLabel: "degrees Celsius",
    options: ["Cool / Dormant", "600-800°C", "800-1000°C", "1000-1200°C", ">1200°C"],
    accentColor: "#ef4444", // Red
    glowColor: "rgba(239, 68, 68, 0.15)",
    soundDescription: "Deafening supersonic gas decompression bursts, molten magma boiling and cracking.",
    imagePrompt: "Volcanology survey closeup magma bubbles popping, crimson neon lava streams flowing in dark ash covered landscape, detailed physics overlay."
  },
  {
    type: "tsunami",
    title: "Tsunami Waves",
    shortDescription: "Extreme oceanic waves formed from undersea seismic earthquakes, sweeping coastal regions.",
    scientificIntro: "Tsunami propagation begins via vertical seafloor displacement, transferring kinetic energy to the whole water column. When approaching shallow margins, shoaling compounds wavelength energy into terrifying vertical heights.",
    parameterName: "Wave Height",
    unitLabel: "meters",
    options: ["1-2m Wave", "3-5m (Shore Flood)", "10-15m (Severe Wave)", "20-30m (Massive)", ">30m (Megatsunami)"],
    accentColor: "#06b6d4", // Cyan
    glowColor: "rgba(6, 182, 212, 0.15)",
    soundDescription: "Thundering hydraulic crash and deep cascading marine suction roar.",
    imagePrompt: "Massive marine wave shoaling near a coastline detailed sea foam droplets, technical digital sensor sketch, ultra detailed ocean blue gradients."
  },
  {
    type: "cyclone",
    title: "Cyclone Vortices",
    shortDescription: "Vast rotating heat engines carrying devastating winds, powered by warm tropical moisture.",
    scientificIntro: "Cyclones are immense convective low-pressure atmospheric vortices. High oceans inject humid lift fuel, which Coriolis acceleration spins around a calm barometric storm eye, unleashing torrential rainfall bands.",
    parameterName: "Wind Velocity",
    unitLabel: "Category (Saffir-Simpson)",
    options: ["Cat 1 (119-153 km/h)", "Cat 2 (154-177 km/h)", "Cat 3 (178-208 km/h)", "Cat 4 (209-251 km/h)", "Cat 5 (>252 km/h)"],
    accentColor: "#10b981", // Emerald
    glowColor: "rgba(16, 185, 129, 0.15)",
    soundDescription: "Continuous atmospheric shrieking winds, heavy microburst impact blasts.",
    imagePrompt: "Aerial hurricane spiral cloud formation, dark satellite storm eye, high velocity winds sweeping across digital ocean wireframe."
  },
  {
    type: "tornado",
    title: "Tornado Funnels",
    shortDescription: "Violent vortex columns reaching downward from severe thunderstorms to devastate terrain.",
    scientificIntro: "Tornadoes arise when horizontal wind shearing meets severe updraft columns inside supercell clouds. This constructs a vertical wind vortex of massive suction speed, collecting heavy dirt debris in seconds.",
    parameterName: "Vortex Scale",
    unitLabel: "Enhanced Fujita (EF Scale)",
    options: ["EF0 (105-137 km/h)", "EF1 (138-177 km/h)", "EF2 (178-217 km/h)", "EF3 (218-266 km/h)", "EF4 (267-322 km/h)", "EF5 (>322 km/h)"],
    accentColor: "#3b82f6", // Blue
    glowColor: "rgba(59, 130, 246, 0.15)",
    soundDescription: "Acoustically intense white noises, structural ripping scream, subsonic freight-train engines.",
    imagePrompt: "Massive swirling dirt tornado touching ground, intense lightning flashes shining, technical storm tracking graphic overlays."
  },
  {
    type: "flood",
    title: "Flash Floods",
    shortDescription: "Rapid environmental water accumulation, submerging landscapes and infrastructure.",
    scientificIntro: "Flash flooding occurs when torrential precipitation outpaces regional soil absorption rate, overflowing catch basins. Dense alluvial currents easily float standard obstacles and erode structural bases.",
    parameterName: "Inundation Depth",
    unitLabel: "feet of water",
    options: ["1-2 ft (Shallow)", "3-5 ft (Moderate)", "6-10 ft (Major)", ">10 ft (Extreme Hydrological)"],
    accentColor: "#6366f1", // Indigo
    glowColor: "rgba(99, 102, 241, 0.15)",
    soundDescription: "Aggressive swirling mud currents, rushing water, splashing and debris collision thuds.",
    imagePrompt: "Flooded street sub-surface simulation, submerged obstacles, moving liquid streams, hydraulic vector lines illustration."
  }
];
