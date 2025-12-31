"use client";

import Image from "next/image";
import { X, FileText, Wrench, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  workflowSteps,
  stepIcons,
  type StepStatus,
} from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";

// Define available tools for AI steps
interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string; // path to icon or emoji
  iconType: "image" | "emoji";
}

const availableTools: Tool[] = [
  {
    id: "excel",
    name: "Outil Excel",
    description: "Lire, écrire et manipuler des feuilles de calcul Excel",
    icon: "/excel.png",
    iconType: "image",
  },
  {
    id: "powerpoint",
    name: "Outil PowerPoint",
    description: "Lire, écrire et manipuler des présentations PowerPoint",
    icon: "/powerpoint.png",
    iconType: "image",
  },
  {
    id: "calculator",
    name: "Calculatrice",
    description: "Effectuer des calculs financiers et des formules",
    icon: "🧮",
    iconType: "emoji",
  },
  {
    id: "chart",
    name: "Générateur de graphiques",
    description: "Créer des graphiques et des visualisations de données",
    icon: "📊",
    iconType: "emoji",
  },
];

// Map step IDs to their enabled tools
const stepTools: Record<string, string[]> = {
  "step-4": ["powerpoint"], // Coherence check for marketing slides
  "step-5": ["excel", "calculator"], // Coherence check for cashflow
  "step-6b": ["excel"], // Coherence check for reporting excel
  "step-7": ["excel", "calculator", "chart"], // Fill Reporting Excel
  "step-8": ["powerpoint", "excel", "chart"], // Fill Reporting Slides
  "step-9": ["powerpoint", "excel"], // Final coherence check
};

interface StepAuditPanelProps {
  stepId: string;
  status: StepStatus;
  onClose: () => void;
}

// Role badge styles
const nodeRoleBadges: Record<string, { label: string; className: string }> = {
  input: { label: "Input", className: "bg-blue-100 text-blue-700 border-blue-200" },
  coherence_check: { label: "AI Check", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ai_processing: { label: "AI Process", className: "bg-purple-100 text-purple-700 border-purple-200" },
  output: { label: "Output", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

export function StepAuditPanel({ stepId, onClose }: StepAuditPanelProps) {
  const step = workflowSteps.find((s) => s.id === stepId);
  if (!step) return null;

  const isAIStep = step.type === "ai_processing" || step.type === "coherence_check";
  const enabledToolIds = stepTools[stepId] || [];
  const enabledTools = availableTools.filter((tool) => enabledToolIds.includes(tool.id));

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

      {/* Role badge */}
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        {nodeRoleBadges[step.type] && (
          <span className={cn(
            "px-3 py-1 rounded border text-sm font-medium",
            nodeRoleBadges[step.type].className
          )}>
            {nodeRoleBadges[step.type].label}
          </span>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Prompt section - only for AI steps */}
          {isAIStep && step.prompt && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <h4 className="text-sm font-semibold text-black">Prompt</h4>
              </div>
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="text-sm text-zinc-700 leading-relaxed">
                  {step.prompt}
                </p>
              </div>
            </div>
          )}

          {/* Tools section - only for AI steps */}
          {isAIStep && enabledTools.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-zinc-500" />
                <h4 className="text-sm font-semibold text-black">Outils activés</h4>
              </div>
              <div className="space-y-2">
                {enabledTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg"
                  >
                    {tool.iconType === "image" ? (
                      <Image
                        src={tool.icon}
                        alt={tool.name}
                        width={24}
                        height={24}
                        className="flex-shrink-0"
                      />
                    ) : (
                      <span className="text-xl flex-shrink-0">{tool.icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-black">
                        {tool.name}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {tool.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input node info */}
          {step.type === "input" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                <h4 className="text-sm font-semibold text-black">Configuration d'entrée</h4>
              </div>
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="text-sm text-zinc-700">
                  Ce nœud accepte des fichiers {step.subtitle.includes("Excel") ? "Excel" : "PowerPoint"} en entrée.
                </p>
              </div>
            </div>
          )}

          {/* Output node info */}
          {step.type === "output" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-500" />
                <h4 className="text-sm font-semibold text-black">Configuration de sortie</h4>
              </div>
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg">
                <p className="text-sm text-zinc-700">
                  Ce nœud exporte le fichier {step.subtitle.includes("Excel") ? "Excel" : "PowerPoint"} final.
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
