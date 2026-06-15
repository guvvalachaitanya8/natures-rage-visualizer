export type DisasterType = "earthquake" | "volcano" | "tsunami" | "cyclone" | "tornado" | "flood";

export type VisualStyle = "cartoon" | "realistic";

export interface DisasterProfile {
  type: DisasterType;
  title: string;
  shortDescription: string;
  scientificIntro: string;
  parameterName: string;
  options: string[];
  unitLabel: string;
  accentColor: string;
  glowColor: string;
  soundDescription: string;
  imagePrompt: string; // Used for descriptive layout
}

export interface Feedback {
  id: string;
  timestamp: string;
  username: string;
  email: string;
  comment: string;
  requestUpdate: string;
  disasterReference?: string;
  rating: number;
}

export interface SimulationGraphPoint {
  time: number;
  metricVal: number;
  metricSecondary: number;
}

export interface SimulationResult {
  status: string;
  aiGenerated: boolean;
  decibel: string;
  summary: string;
  precautions: string[];
  metricLabel: string;
  secondaryLabel: string;
  graphData: SimulationGraphPoint[];
  simulationConfig: {
    intensityMultiplier: number;
    speedFactor: number;
    colorTheme: string;
    customLabel: string;
  };
}
