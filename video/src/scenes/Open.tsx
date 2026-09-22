import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SERIF, MONO } from "../fonts";

// The author's line, chosen by the operator and already shipped on the site.
// A model may not write this: an invented headline silently becomes the product's voice.
const HEADLINE = "Someone has to tell everyone.";

export const Open: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const y = interpolate(rise, [0, 1], [18, 0]);
  const rule = interpolate(frame, [12, 44], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markOpacity = interpolate(frame, [30, 52], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.paper,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ width: 1200, transform: `translateY(${y}px)`, opacity: rise }}>
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 82,
            fontWeight: 400,
            color: COLORS.ink,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          {HEADLINE}
        </div>
        <div
          style={{
            height: 1,
            background: COLORS.rule,
            marginTop: 34,
            transform: `scaleX(${rule})`,
            transformOrigin: "left center",
          }}
        />
        <div
          style={{
            fontFamily: MONO,
            fontSize: 21,
            color: COLORS.accent,
            marginTop: 22,
            opacity: markOpacity,
            letterSpacing: "0.02em",
          }}
        >
          Kin — the death admin inbox
        </div>
      </div>
    </AbsoluteFill>
  );
};
