import React, { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Cube,
  Gauge,
  Waveform,
  Warning,
  Wrench,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Sparkle,
  Sliders,
  CheckCircle
} from "@phosphor-icons/react"

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Words for the mandatory tagline reveal section (B11)
  const taglineLine1 = ["One", "failing", "bearing", "can", "slow", "the", "whole", "line."]
  const taglineLine2 = ["See", "where", "it", "starts,", "where", "it", "spreads,", "and", "who", "can", "fix", "it", "first."]

  return (
    <div className="min-h-screen wellness-atmosphere text-[#f4f6f8] selection:bg-[#2b3a42] selection:text-white antialiased">
      {/* Floating Centred Navigation Bar (Layout C) */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-6 px-5 py-2.5 rounded-full bg-[#1c2127]/90 backdrop-blur-md border border-[rgba(184,197,214,0.22)] shadow-2xl max-w-2xl w-full">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="size-7 rounded-md wellness-contrast-brown flex items-center justify-center shadow-sm">
              <Cube className="size-4 text-[#fdf8f5]" />
            </div>
            <span className="font-neuton text-lg font-bold text-[#f4f6f8] tracking-tight">
              Beyond Factory Floor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/factory")}
              className="caption-3 text-[#b8c5d6] hover:text-white transition-colors duration-300 hidden sm:inline"
            >
              3D Digital Twin
            </button>
            <button
              onClick={() => navigate("/app/overview")}
              className="py-1.5 px-4 rounded-full wellness-contrast-bluegray hover:bg-[#3d2e26] text-[#eef3f6] hover:text-[#fdf8f5] button-xsm font-semibold transition-all duration-300 active:scale-[0.98] shadow-md"
            >
              Launch Control Room
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Prototype Category Badge with Gentle Pink & Green */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full wellness-pill-pink mb-6 shadow-sm">
          <span className="size-2 rounded-full bg-[#a3b899] animate-pulse" />
          <span className="caption-3 font-mono text-[#f3d8d8] tracking-wide uppercase font-semibold">
            Wellness & Precision Industrial Digital Twin
          </span>
        </div>

        {/* Hero Headline with Neuton font */}
        <h1 className="font-neuton text-5xl sm:text-6xl text-[#f4f6f8] text-balance max-w-3xl font-normal tracking-tight leading-tight">
          Find the machine behind the slowdown
        </h1>

        {/* Subhead with tranquil blue tones */}
        <p className="body-4 text-[#b8c5d6] text-pretty max-w-2xl mt-4 leading-relaxed">
          Watches simulated sensors in real time, maps physical dependencies across the line, and recommends who should fix what first in a calm, clear environment.
        </p>

        {/* Primary CTA Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-8 w-full sm:w-auto">
          <button
            onClick={() => navigate("/app/overview")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#f4f6f8] text-[#2b3a42] hover:bg-[#e8c5c8] hover:text-[#3d2e26] button-md font-semibold transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/30"
          >
            <span className="font-neuton text-lg">Open the control room</span>
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => navigate("/app/simulation")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl wellness-card text-[#dbe4ef] hover:text-white hover:border-[#b8c5d6] button-md transition-all duration-300 active:scale-[0.98]"
          >
            <Sliders className="size-4 text-[#a3b899]" />
            <span className="font-neuton text-lg">What If Simulation</span>
          </button>
        </div>

        {/* Proof Signal Bar */}
        <div className="mt-14 pt-8 border-t border-[rgba(184,197,214,0.18)] w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="wellness-card p-3">
            <div className="heading-4 font-neuton text-[#a3b899]">3</div>
            <div className="caption-4 text-[#b8c5d6] mt-0.5">Connected Stations</div>
          </div>
          <div className="wellness-card p-3">
            <div className="heading-4 font-neuton text-[#b8c5d6]">8</div>
            <div className="caption-4 text-[#b8c5d6] mt-0.5">Sensor Channels</div>
          </div>
          <div className="wellness-card p-3">
            <div className="heading-4 font-neuton text-[#e8c5c8]">5</div>
            <div className="caption-4 text-[#b8c5d6] mt-0.5">Failure Scenarios</div>
          </div>
          <div className="wellness-card p-3">
            <div className="heading-4 font-neuton text-[#f4f6f8]">100%</div>
            <div className="caption-4 text-[#b8c5d6] mt-0.5">Simulated Inputs</div>
          </div>
        </div>
      </section>

      {/* Mandatory Tagline Reveal Section */}
      <section className="py-24 px-4 bg-[#181d23] border-y border-[rgba(184,197,214,0.18)]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="caption-3 font-mono text-[#e8c5c8] uppercase tracking-wider mb-2 font-medium">
            The Production Line Challenge
          </div>

          {/* Line 1 */}
          <div className="font-neuton text-3xl sm:text-4xl font-normal text-balance flex flex-wrap justify-center gap-x-2 gap-y-1">
            {taglineLine1.map((word, i) => (
              <span
                key={i}
                className="transition-opacity duration-700 text-[#f4f6f8]"
                style={{ opacity: scrollY > 200 ? 1 : 0.35 + (i * 0.08) }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 2 */}
          <div className="font-neuton text-3xl sm:text-4xl font-normal text-balance flex flex-wrap justify-center gap-x-2 gap-y-1 text-[#a3b899]">
            {taglineLine2.map((word, i) => (
              <span
                key={i}
                className="transition-opacity duration-700"
                style={{ opacity: scrollY > 300 ? 1 : 0.35 + (i * 0.05) }}
              >
                {word}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 4 Core Pillars Grid */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-neuton text-3xl sm:text-4xl text-[#f4f6f8]">Engineered for Decision Clarity</h2>
          <p className="body-6 text-[#b8c5d6] mt-1">
            Zero black-box hallucinations. Physics thresholds and deterministic graph topology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="wellness-card p-6 space-y-3">
            <div className="size-10 rounded-xl wellness-pill-blue flex items-center justify-center text-[#dbe4ef]">
              <Cube className="size-5" />
            </div>
            <h3 className="font-neuton text-2xl text-[#f4f6f8]">Interactive 3D Digital Twin</h3>
            <p className="body-5 text-[#b8c5d6] leading-relaxed">
              Real-time React Three Fiber viewport with procedural machine geometries, status beacon light towers, and downstream starvation floor rings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="wellness-card p-6 space-y-3">
            <div className="size-10 rounded-xl wellness-pill-green flex items-center justify-center text-[#c9dac3]">
              <Waveform className="size-5" />
            </div>
            <h3 className="font-neuton text-2xl text-[#f4f6f8]">Explainable Anomaly Scoring</h3>
            <p className="body-5 text-[#b8c5d6] leading-relaxed">
              Piecewise continuous threshold grading paired with Scikit-learn Isolation Forest (capped at 15 points) and deterministic physical rule match counts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="wellness-card p-6 space-y-3">
            <div className="size-10 rounded-xl wellness-pill-pink flex items-center justify-center text-[#f3d8d8]">
              <Gauge className="size-5" />
            </div>
            <h3 className="font-neuton text-2xl text-[#f4f6f8]">NetworkX Production Impact</h3>
            <p className="body-5 text-[#b8c5d6] leading-relaxed">
              Topological directed graph models material flow from CNC Milling to Conveyor to Packaging, isolating the true root cause and estimating lost line UPH.
            </p>
          </div>

          {/* Card 4 */}
          <div className="wellness-card p-6 space-y-3">
            <div className="size-10 rounded-xl wellness-contrast-brown flex items-center justify-center text-[#fdf8f5]">
              <Wrench className="size-5" />
            </div>
            <h3 className="font-neuton text-2xl text-[#f4f6f8]">Prescriptive Work Orders</h3>
            <p className="body-5 text-[#b8c5d6] leading-relaxed">
              Automated resource recommender pairs active symptoms with compatible spare parts (mapping stock-out alternatives) and dispatches qualified technicians.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 bg-[#181d23] border-t border-[rgba(184,197,214,0.18)] text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-neuton text-3xl sm:text-4xl text-[#f4f6f8]">Experience the Digital Twin</h2>
          <p className="body-6 text-[#b8c5d6]">
            Launch the interactive dashboard to inspect live telemetry, test failure scenarios, and explore the 3D cell.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/app/overview")}
              className="py-3 px-7 rounded-xl bg-[#f4f6f8] text-[#2b3a42] hover:bg-[#e8c5c8] hover:text-[#3d2e26] font-neuton text-xl font-semibold transition-all duration-300 active:scale-[0.98] shadow-lg shadow-black/20"
            >
              Enter Control Room
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[rgba(184,197,214,0.18)] max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 caption-4 text-[#b8c5d6]">
        <div>
          Beyond the Factory Floor • Industrial Digital Twin Decision Support Prototype
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/app/overview")} className="hover:text-white transition-colors">
            Overview
          </button>
          <button onClick={() => navigate("/app/factory")} className="hover:text-white transition-colors">
            3D Twin
          </button>
          <button onClick={() => navigate("/app/simulation")} className="hover:text-white transition-colors">
            Simulation
          </button>
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
            API Docs
          </a>
        </div>
      </footer>
    </div>
  )
}
