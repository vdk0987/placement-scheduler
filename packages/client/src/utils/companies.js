const massRecruiterNames = [
  "TechServe Solutions",
  "GlobalSys",
  "Innova Services",
  "CloudBridge",
  "NextGen Consulting",
  "DigitalWorks",
  "EnterpriseStack",
];

const midTierNames = [
  "ByteCraft",
  "CodeOrbit",
  "DataForge",
  "Vertex Labs",
  "Nimbus Technologies",
  "PixelWorks",
  "CoreStack",
  "AlgoSphere",
  "QuantumSoft",
  "DevWave",
  "BlueGrid",
  "LogicLoop",
  "ScaleLabs",
  "NovaTech",
  "StackRiver",
  "Fusion Systems",
  "Orbit Software",
  "Prism Technologies",
  "Vector Labs",
  "Zenith Systems",
  "ArcTech",
  "Cognix",
  "HyperByte",
];

const highTierNames = [
  "Apex AI Research",
  "Quantum Dynamics",
  "Vertex Robotics",
  "DeepCore Systems",
  "NeuralForge",
];

const companyNames = [...massRecruiterNames, ...midTierNames, ...highTierNames];

export function getCompanyName(companyId) {
  const match = String(companyId ?? "").match(/(\d+)$/);
  const companyNumber = Number(match?.[1]);

  return companyNames[companyNumber - 1] ?? companyId ?? "Company not assigned";
}
