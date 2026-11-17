import React from "react"
import { ShieldCheck } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"

export function EmptyState({
  icon = <ShieldCheck className="size-8 text-[#9B9B9B]" />,
  title = "No active records",
  description = "All parameters are within normal boundaries.",
  action = null,
  className
}) {
  return (
    <div
      className={cn(
        "bg-[#181818] border border-[#313131] rounded-xl p-8 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="p-3 bg-[#1F1F1F] rounded-full mb-3 border border-[#313131]">
        {icon}
      </div>
      <h3 className="title-3 text-white mb-1">{title}</h3>
      <p className="body-6 text-[#9B9B9B] max-w-sm mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
