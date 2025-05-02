"use client";

import React from "react";
import { motion } from "framer-motion";
import Particles from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Engine } from "@tsparticles/engine";

import "@fontsource/inter"; // or swap with Satoshi if you prefer

export default function HomePage() {
  const particlesInit = async (engine: Engine) => {
    await loadFull(engine);
  };

  return (
    <main className="min-h-screen bg-black font-sans text-white relative overflow-hidden">
      {/* Particle Background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          background: { color: "#000" },
          particles: {
            number: { value: 50, density: { enable: true, area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.2 },
            size: { value: { min: 1, max: 3 } },
            links: {
              enable: true,
              color: "#ffffff",
              distance: 150,
              opacity: 0.2,
              width: 1,
            },
            move: { enable: true, speed: 0.5 },
          },
        }}
      />

      {/* Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-white/10 border-b border-white/10 px-8 py-4 flex justify-between items-center">
        <span className="text-xl font-bold tracking-wide text-white">Rainien</span>
        <div className="space-x-6 text-sm">
          <a href="#features" className="hover:text-red-400 transition">Features</a>
          <a href="#services" className="hover:text-red-400 transition">Services</a>
          <a href="#contact" className="hover:text-red-400 transition">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-red-500 to-fuchsia-500 text-transparent bg-clip-text"
        >
          Next-Gen AI Infrastructure
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-6 max-w-xl text-gray-300 text-lg"
        >
          Scalable, secure, and designed for the future. Build, deploy, and grow with Rainien.
        </motion.p>
        <motion.a
          href="#features"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 inline-block px-6 py-3 bg-red-600 hover:bg-red-500 transition rounded-full text-white font-medium shadow-lg"
        >
          Get Started
        </motion.a>
      </section>
    </main>
  );
}
