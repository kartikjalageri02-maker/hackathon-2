import React from "react"
import { useNavigate } from "react-router-dom"
import { Factory, House } from "@phosphor-icons/react"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-center p-6 text-white">
      <div className="p-4 bg-[#181818] border border-[#313131] rounded-2xl mb-4">
        <Factory className="size-12 text-[#9B9B9B]" />
      </div>
      <h1 className="heading-3 font-mono mb-2">404</h1>
      <h2 className="title-1 mb-2">Station Not Found</h2>
      <p className="body-6 text-[#9B9B9B] max-w-md mb-6">
        The requested monitoring route or machine identifier does not exist in this factory cell.
      </p>
      <button
        onClick={() => navigate("/app/overview")}
        className="flex items-center gap-2 py-2 px-3 rounded-lg bg-white text-black button-sm hover:bg-neutral-200 transition-colors duration-300"
      >
        <House className="size-4" weight="fill" />
        <span>Return to control room</span>
      </button>
    </div>
  )
}
