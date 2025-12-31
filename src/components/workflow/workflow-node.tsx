"use client";

import { cn } from "@/lib/utils";
import { type StepStatus, type StepType, stepIcons } from "@/data/mock-data";

interface WorkflowNodeProps {
  id: string;
  name: string;
  type: StepType;
  status: StepStatus;
  isSelected: boolean;
  onClick: () => void;
}

const statusColors: Record<StepStatus, string> = {
  pending: "bg-zinc-700 border-zinc-600",
  running: "bg-blue-900/50 border-blue-500 ring-2 ring-blue-500/50",
  completed: "bg-emerald-900/50 border-emerald-500",
  failed: "bg-red-900/50 border-red-500",
  needs_review: "bg-amber-900/50 border-amber-500 ring-2 ring-amber-500/50",
};

const statusBadgeColors: Record<StepStatus, string> = {
  pending: "bg-zinc-600 text-zinc-300",
  running: "bg-blue-500 text-white",
  completed: "bg-emerald-500 text-white",
  failed: "bg-red-500 text-white",
  needs_review: "bg-amber-500 text-black",
};

const statusLabels: Record<StepStatus, string> = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  needs_review: "Review",
};

export function WorkflowNode({
  name,
  type,
  status,
  isSelected,
  onClick,
}: WorkflowNodeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 min-w-[140px] cursor-pointer",
        statusColors[status],
        isSelected && "ring-2 ring-white/50 scale-105",
        status === "running" && "animate-pulse"
      )}
    >
      {/* Icon */}
      <div className="text-3xl mb-2">{stepIcons[type]}</div>

      {/* Name */}
      <div className="text-sm font-medium text-center text-white leading-tight">
        {name}
      </div>

      {/* Status badge */}
      <div
        className={cn(
          "absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-medium",
          statusBadgeColors[status]
        )}
      >
        {statusLabels[status]}
      </div>
    </button>
  );
}
