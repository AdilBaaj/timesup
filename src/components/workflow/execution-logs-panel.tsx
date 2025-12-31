"use client";

import { X, Terminal, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  workflowSteps,
  stepIcons,
  mockLogs,
  type StepStatus,
} from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExecutionLogsPanelProps {
  stepId: string;
  status: StepStatus;
  onClose: () => void;
}

// Status indicator styles
const statusStyles: Record<StepStatus, { icon: React.ReactNode; label: string; className: string }> = {
  pending: {
    icon: <Clock className="w-4 h-4" />,
    label: "En attente",
    className: "bg-zinc-100 text-zinc-600",
  },
  running: {
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    label: "En cours",
    className: "bg-blue-100 text-blue-700",
  },
  completed: {
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Terminé",
    className: "bg-emerald-100 text-emerald-700",
  },
  failed: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "Échoué",
    className: "bg-red-100 text-red-700",
  },
  needs_review: {
    icon: <AlertCircle className="w-4 h-4" />,
    label: "En révision",
    className: "bg-amber-100 text-amber-700",
  },
};

export function ExecutionLogsPanel({ stepId, status, onClose }: ExecutionLogsPanelProps) {
  const step = workflowSteps.find((s) => s.id === stepId);
  if (!step) return null;

  const logs = mockLogs[stepId] || [];
  const statusInfo = statusStyles[status];

  return (
    <div className="bg-white border-l border-zinc-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{stepIcons[step.type]}</span>
          <div>
            <h3 className="font-semibold text-black">{step.name}</h3>
            <p className="text-sm text-zinc-500">{step.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>

      {/* Status badge */}
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg",
          statusInfo.className
        )}>
          {statusInfo.icon}
          <span className="text-sm font-medium">{statusInfo.label}</span>
        </div>
      </div>

      {/* Logs section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200">
          <Terminal className="w-4 h-4 text-zinc-500" />
          <h4 className="text-sm font-semibold text-black">Logs d&apos;exécution</h4>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            {logs.length > 0 ? (
              <div className="font-mono text-xs space-y-1 bg-zinc-900 rounded-lg p-4">
                {logs.map((log, index) => (
                  <div
                    key={index}
                    className={cn(
                      "leading-relaxed",
                      log.includes("✓") ? "text-emerald-400" : "text-zinc-300"
                    )}
                  >
                    {log}
                  </div>
                ))}
                {status === "running" && (
                  <div className="text-blue-400 animate-pulse">
                    Processing...
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun log disponible</p>
                {status === "pending" && (
                  <p className="text-xs mt-1">Les logs apparaîtront lors de l&apos;exécution</p>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
