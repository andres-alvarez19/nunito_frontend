export const palette = {
  background: "#F4FBF8",
  surface: "#FFFFFF",
  surfaceMuted: "#DAE5E2",
  primary: "#006A61",
  primaryOn: "#FFFFFF",
  secondary: "#4A635F",
  secondaryOn: "#FFFFFF",
  accent: "#82D5CA",
  accentOn: "#005049",
  text: "#161D1C",
  muted: "#3F4947",
  border: "#BEC9C6",
  error: "#BA1A1A",
  errorOn: "#FFFFFF",
  mint: "#38693C",
  mintOn: "#FFFFFF",
  mintContainer: "#B9F0B8",
  pastel: "#745B0C",
  pastelOn: "#FFFFFF",
  pastelContainer: "#FFDF90",
  violet: "#615690",
  violetOn: "#FFFFFF",
  violetContainer: "#E6DEFF",
  rose: "#8C4A60",
  roseOn: "#FFFFFF",
  roseContainer: "#FFD9E2",
  blue: "#415F91",
  blueOn: "#FFFFFF",
  blueContainer: "#D6E3FF",
};

export type PaletteKey = keyof typeof palette;

export const withAlpha = (hex: string, alpha: number) => {
  const normalized = Math.round(Math.min(Math.max(alpha, 0), 1) * 255);
  const alphaHex = normalized.toString(16).padStart(2, "0");
  return `#${alphaHex}${hex.replace("#", "")}`;
};
