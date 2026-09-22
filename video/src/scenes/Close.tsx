import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../constants";
import { SERIF, MONO, INTER } from "../fonts";

// Every figure here was produced by a run against the production deployment
// before this video was cut. None of it is illustrative.
const FACTS = [
  ["Organisations that accept email", "1 of 7"],
  ["Facts kept that were not on the page", "0"],
  ["Model that read the page", "gpt-5"],
];

export const Close: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 28 });

  return (
    <AbsoluteFill
      style={{ backgroundColor: COLORS.paper, justifyContent: "center", alignItems: "center" }}
    >
      <div style={{ width: 1180, opacity: rise, transform: `translateY(${interpolate(rise, [0, 1], [16, 0])}px)` }}>
        <div style={{ fontFamily: SERIF, fontSize: 74, color: COLORS.ink, letterSpacing: "-0.02em" }}>
          Kin
        </div>
        <div style={{ height: 1, background: COLORS.rule, margin: "26px 0 22px" }} />

        {FACTS.map(([label, value], i) => {
          const o = interpolate(frame, [22 + i * 10, 46 + i * 10], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                padding: "11px 0",
                borderTop: i === 0 ? "none" : `1px solid ${COLORS.rule}`,
                opacity: o,
              }}
            >
              <span style={{ fontFamily: INTER, fontSize: 26, color: COLORS.ink2 }}>{label}</span>
              <span style={{ fontFamily: MONO, fontSize: 26, color: COLORS.accent }}>{value}</span>
            </div>
          );
        })}

        <div
          style={{
            fontFamily: MONO,
            fontSize: 25,
            color: COLORS.ink,
            marginTop: 40,
            opacity: interpolate(frame, [64, 92], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          acrobatic-condor-542.convex.site
        </div>
        <div
          style={{
            fontFamily: INTER,
            fontSize: 21,
            color: COLORS.ink3,
            marginTop: 12,
            opacity: interpolate(frame, [80, 108], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          Convex · OpenAI · Firecrawl · AgentMail
        </div>
      </div>
    </AbsoluteFill>
  );
};
