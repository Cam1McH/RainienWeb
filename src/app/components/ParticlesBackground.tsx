// components/ParticlesBackground.tsx
"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: 0 },
        background: { color: "#0f0f0f" },
        particles: {
          number: { value: 60, density: { enable: true, value_area: 800 } },
          color: { value: "#ec4899" },
          shape: { type: "circle" },
          opacity: { value: 0.4 },
          size: { value: 3 },
          move: { enable: true, speed: 1, direction: "none", outModes: "out" },
          links: {
            enable: true,
            distance: 150,
            color: "#ec4899",
            opacity: 0.3,
            width: 1,
          },
        },
      }}
    />
  );
}
