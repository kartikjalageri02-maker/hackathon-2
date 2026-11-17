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
    <div className="min-h-screen bg-[#000000] text-white selection:bg-neutral-800 selection:text-white font-sans antialiased">
      {/* Floating Centred Navigation Bar (Layout C) */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center justify-between gap-6 px-4 py-2.5 rounded-full bg-[#181818]/90 backdrop-blur-md border border-[#313131] shadow-2xl max-w-2xl w-full">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="size-6 rounded-md bg-[#1F1F1F] border border-[#313131] flex items-center justify-center">
              <Cube className="size-3.5 text-white" />
            </div>
            <span className="title-4 font-mono font-semibold text-white tracking-tight">
              Beyond Factory Floor
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/app/factory")}
              className="caption-3 text-[#9B9B9B] hover:text-white transition-colors duration-300 hidden sm:inline"
            >
              3D Digital Twin
            </button>
            <button
              onClick={() => navigate("/app/overview")}
              className="py-1.5 px-3.5 rounded-full bg-white text-black button-xsm font-semibold hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98]"
            >
              Launch Control Room
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 px-4 sm:px-6 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Prototype Category Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181818] border border-[#313131] mb-6">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="caption-3 font-mono text-white tracking-wide uppercase">
            Industrial Digital Twin Prototype
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="heading-1 text-white text-balance max-w-3xl font-medium tracking-tight">
          Find the machine behind the slowdown
        </h1>

        {/* Subhead */}
        <p className="body-4 text-[#9B9B9B] text-pretty max-w-2xl mt-4 leading-relaxed">
          Watches simulated sensors in real time, maps physical dependencies across the line, and recommends who should fix what first.
        </p>

        {/* Primary CTA Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 w-full sm:w-auto">
          <button
            onClick={() => navigate("/app/overview")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white text-black button-md font-semibold hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98] shadow-lg shadow-white/5"
          >
            <span>Open the control room</span>
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={() => navigate("/app/simulation")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#181818] hover:bg-[#272727] border border-[#313131] text-white button-md transition-all duration-300 active:scale-[0.98]"
          >
            <Sliders className="size-4 text-[#9B9B9B]" />
            <span>What If Simulation</span>
          </button>
        </div>

        {/* Proof Signal Bar (True facts only) */}
        <div className="mt-14 pt-8 border-t border-[#313131] w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-[#131209] border border-[#272727]">
            <div className="heading-4 font-mono text-white">3</div>
            <div className="caption-4 text-[#9B9B9B] mt-0.5">Connected Stations</div>
          </div>
          <div className="p-3 rounded-lg bg-[#131209] border border-[#272727]">
            <div className="heading-4 font-mono text-white">8</div>
            <div className="caption-4 text-[#9B9B9B] mt-0.5">Sensor Channels</div>
          </div>
          <div className="p-3 rounded-lg bg-[#131209] border border-[#272727]">
            <div className="heading-4 font-mono text-white">5</div>
            <div className="caption-4 text-[#9B9B9B] mt-0.5">Failure Scenarios</div>
          </div>
          <div className="p-3 rounded-lg bg-[#131209] border border-[#272727]">
            <div className="heading-4 font-mono text-white">100%</div>
            <div className="caption-4 text-[#9B9B9B] mt-0.5">Simulated Inputs</div>
          </div>
        </div>
      </section>

      {/* Mandatory Tagline Reveal Section (B11) */}
      <section className="py-24 px-4 bg-[#131209] border-y border-[#313131]">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="caption-3 font-mono text-[#9B9B9B] uppercase tracking-wider mb-2">
            The Production Line Challenge
          </div>

          {/* Line 1 */}
          <div className="heading-3 sm:heading-2 font-medium text-balance flex flex-wrap justify-center gap-x-2 gap-y-1">
            {taglineLine1.map((word, i) => (
              <span
                key={i}
                className="transition-opacity duration-700 text-white"
                style={{ opacity: scrollY > 200 ? 1 : 0.35 + (i * 0.08) }}
              >
                {word}
              </span>
            ))}
          </div>

          {/* Line 2 */}
          <div className="heading-3 sm:heading-2 font-medium text-balance flex flex-wrap justify-center gap-x-2 gap-y-1 text-emerald-400">
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
          <h2 className="heading-4 text-white">Engineered for Decision Clarity</h2>
          <p className="body-6 text-[#9B9B9B] mt-1">
            Zero black-box hallucinations. Physics thresholds and deterministic graph topology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 */}
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
            <div className="size-10 rounded-xl bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-white">
              <Cube className="size-5" />
            </div>
            <h3 className="title-2 text-white">Interactive 3D Digital Twin</h3>
            <p className="body-5 text-[#9B9B9B] leading-relaxed">
              Real-time React Three Fiber viewport with procedural machine geometries, status beacon light towers, and downstream starvation floor rings.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
            <div className="size-10 rounded-xl bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-white">
              <Waveform className="size-5" />
            </div>
            <h3 className="title-2 text-white">Explainable Anomaly Scoring</h3>
            <p className="body-5 text-[#9B9B9B] leading-relaxed">
              Piecewise continuous threshold grading paired with Scikit-learn Isolation Forest (capped at 15 points) and deterministic physical rule match counts.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
            <div className="size-10 rounded-xl bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-white">
              <Gauge className="size-5" />
            </div>
            <h3 className="title-2 text-white">NetworkX Production Impact</h3>
            <p className="body-5 text-[#9B9B9B] leading-relaxed">
              Topological directed graph models material flow from CNC Milling to Conveyor to Packaging, isolating the true root cause and estimating lost line UPH.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#181818] border border-[#313131] rounded-2xl p-6 space-y-3">
            <div className="size-10 rounded-xl bg-[#1F1F1F] border border-[#313131] flex items-center justify-center text-white">
              <Wrench className="size-5" />
            </div>
            <h3 className="title-2 text-white">Prescriptive Work Orders</h3>
            <p className="body-5 text-[#9B9B9B] leading-relaxed">
              Automated resource recommender pairs active symptoms with compatible spare parts (mapping stock-out alternatives) and dispatches qualified technicians.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 bg-[#181818] border-t border-[#313131] text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="heading-4 text-white">Experience the Digital Twin</h2>
          <p className="body-6 text-[#9B9B9B]">
            Launch the interactive dashboard to inspect live telemetry, test failure scenarios, and explore the 3D cell.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/app/overview")}
              className="py-3 px-6 rounded-xl bg-white text-black button-md font-semibold hover:bg-neutral-200 transition-all duration-300 active:scale-[0.98]"
            >
              Enter Control Room
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-[#313131] max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 caption-4 text-[#9B9B9B]">
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
