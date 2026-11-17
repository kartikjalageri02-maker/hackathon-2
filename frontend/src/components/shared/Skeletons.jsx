import React from "react"
import { cn } from "@/lib/utils"

export function SkeletonBox({ className }) {
  return (
    <div
      className={cn(
        "bg-[#1F1F1F] rounded-lg animate-pulse",
        className
      )}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-[#181818] border border-[#313131] rounded-xl p-4 flex flex-col justify-between h-32">
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-4 w-28" />
        <SkeletonBox className="size-6 rounded-md" />
      </div>
      <SkeletonBox className="h-8 w-20" />
      <SkeletonBox className="h-3 w-36" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <div className="flex items-center gap-4 py-3 px-4 border-b border-[#313131] bg-[#181818]">
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBox key={i} className="h-4 flex-1" />
      ))}
    </div>
  )
}
