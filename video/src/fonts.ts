import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/Spectral";

export const { fontFamily: INTER } = loadInter("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const { fontFamily: MONO } = loadMono("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});

// Kin's landing page sets in a serif. The video matches it rather than
// defaulting to the usual geometric sans.
export const { fontFamily: SERIF } = loadSerif("normal", {
  weights: ["400", "600"],
  subsets: ["latin"],
});
