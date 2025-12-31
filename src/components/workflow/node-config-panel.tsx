"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, FileText, MessageSquare, Wrench, Settings2, FileInput, FileOutput, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  workflowSteps,
  stepIcons,
  type StepType,
  type StepStatus,
} from "@/data/mock-data";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

// Node type configuration
interface NodeTypeConfig {
  id: StepType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const nodeTypes: NodeTypeConfig[] = [
  {
    id: "input",
    label: "Entrée",
    description: "Nœud d'entrée pour les fichiers sources",
    icon: <FileInput className="w-4 h-4" />,
  },
  {
    id: "coherence_check",
    label: "Contrôle IA",
    description: "Validation et contrôle de cohérence par IA",
    icon: <CheckCircle className="w-4 h-4" />,
  },
  {
    id: "ai_processing",
    label: "Traitement IA",
    description: "Traitement et transformation par IA",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: "output",
    label: "Sortie",
    description: "Nœud de sortie pour les fichiers générés",
    icon: <FileOutput className="w-4 h-4" />,
  },
];

// File types for input/output
interface FileType {
  id: string;
  label: string;
  extension: string;
  icon: string;
  iconType: "image" | "emoji";
}

const fileTypes: FileType[] = [
  { id: "excel", label: "Excel", extension: ".xlsx", icon: "/excel.png", iconType: "image" },
  { id: "powerpoint", label: "PowerPoint", extension: ".pptx", icon: "/powerpoint.png", iconType: "image" },
  { id: "pdf", label: "PDF", extension: ".pdf", icon: "/pdf.png", iconType: "image" },
  { id: "csv", label: "CSV", extension: ".csv", icon: "/csv.png", iconType: "image" },
  { id: "image", label: "Image", extension: ".png, .jpg", icon: "/image.png", iconType: "image" },
];

// Available tools for AI nodes
interface Tool {
  id: string;
  name: string;
  capabilities: string;
  icon: string;
  iconType: "image" | "emoji";
}

const availableTools: Tool[] = [
  {
    id: "excel",
    name: "Excel",
    capabilities: "lecture, écriture",
    icon: "/excel.png",
    iconType: "image",
  },
  {
    id: "powerpoint",
    name: "PowerPoint",
    capabilities: "lecture, écriture",
    icon: "/powerpoint.png",
    iconType: "image",
  },
  {
    id: "calculator",
    name: "Calculatrice",
    capabilities: "calculs, formules",
    icon: "🧮",
    iconType: "emoji",
  },
  {
    id: "chart",
    name: "Graphiques",
    capabilities: "création, export",
    icon: "📊",
    iconType: "emoji",
  },
  {
    id: "web_search",
    name: "Recherche Web",
    capabilities: "recherche, extraction",
    icon: "🌐",
    iconType: "emoji",
  },
  {
    id: "document_reader",
    name: "Lecteur PDF",
    capabilities: "lecture, OCR",
    icon: "📖",
    iconType: "emoji",
  },
];

// Node configuration state
export interface NodeConfig {
  id: string;
  name: string;
  type: StepType;
  // Input node config
  acceptedFileTypes?: string[];
  // AI node config (coherence_check & ai_processing)
  prompt?: string;
  inputType?: string;
  outputType?: string;
  enabledTools?: string[];
  context?: string;
  // Output node config
  outputFileType?: string;
  autoDownload?: boolean;
}

// Role badge styles
const nodeRoleBadges: Record<StepType, { label: string; className: string }> = {
  input: { label: "Entrée", className: "bg-blue-100 text-blue-700 border-blue-200" },
  coherence_check: { label: "Contrôle IA", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ai_processing: { label: "Traitement IA", className: "bg-purple-100 text-purple-700 border-purple-200" },
  output: { label: "Sortie", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

interface NodeConfigPanelProps {
  stepId: string;
  status: StepStatus;
  onClose: () => void;
  onConfigChange?: (config: NodeConfig) => void;
}

export function NodeConfigPanel({ stepId, onClose, onConfigChange }: NodeConfigPanelProps) {
  const step = workflowSteps.find((s) => s.id === stepId);

  // Initialize config state from step data
  const [config, setConfig] = useState<NodeConfig>(() => {
    if (!step) return { id: stepId, name: "", type: "input" };

    // Determine initial file types based on step subtitle
    const initialFileTypes: string[] = [];
    if (step.subtitle.includes("Excel")) initialFileTypes.push("excel");
    if (step.subtitle.includes("PowerPoint")) initialFileTypes.push("powerpoint");

    // Determine initial tools based on step type
    const initialTools: string[] = [];
    if (step.type === "coherence_check" || step.type === "ai_processing") {
      if (step.subtitle.includes("Excel") || step.description.toLowerCase().includes("excel")) {
        initialTools.push("excel", "calculator");
      }
      if (step.subtitle.includes("PowerPoint") || step.description.toLowerCase().includes("slides")) {
        initialTools.push("powerpoint");
      }
      if (step.type === "ai_processing") {
        initialTools.push("chart");
      }
    }

    return {
      id: step.id,
      name: step.name,
      type: step.type,
      acceptedFileTypes: initialFileTypes,
      prompt: step.prompt || "",
      inputType: initialFileTypes[0] || "excel",
      outputType: step.type === "output" ? (step.subtitle.includes("Excel") ? "excel" : "powerpoint") : undefined,
      enabledTools: initialTools,
      context: "",
      outputFileType: step.type === "output" ? (step.subtitle.includes("Excel") ? "excel" : "powerpoint") : undefined,
      autoDownload: false,
    };
  });

  // Notify parent of config changes
  useEffect(() => {
    if (onConfigChange) {
      onConfigChange(config);
    }
  }, [config, onConfigChange]);

  if (!step) return null;

  const updateConfig = (updates: Partial<NodeConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  const toggleFileType = (fileTypeId: string) => {
    const current = config.acceptedFileTypes || [];
    const updated = current.includes(fileTypeId)
      ? current.filter((id) => id !== fileTypeId)
      : [...current, fileTypeId];
    updateConfig({ acceptedFileTypes: updated });
  };

  const toggleTool = (toolId: string) => {
    const current = config.enabledTools || [];
    const updated = current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId];
    updateConfig({ enabledTools: updated });
  };

  const isAIStep = config.type === "ai_processing" || config.type === "coherence_check";

  return (
    <div className="bg-white border-l border-zinc-200 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{stepIcons[config.type]}</span>
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

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Node Type Selector */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-zinc-500" />
              <Label className="text-sm font-semibold text-black">Type de nœud</Label>
            </div>
            <Select
              value={config.type}
              onValueChange={(value: StepType) => updateConfig({ type: value })}
              
            >
              <SelectTrigger className="w-full text-black">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent className="bg-white text-black">
                {nodeTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      {type.icon}
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-zinc-500">
              {nodeTypes.find((t) => t.id === config.type)?.description}
            </p>
          </div>

          {/* Role badge */}
          <div className="px-0">
            <span className={cn(
              "px-3 py-1 rounded border text-sm font-medium",
              nodeRoleBadges[config.type].className
            )}>
              {nodeRoleBadges[config.type].label}
            </span>
          </div>

          {/* INPUT NODE CONFIGURATION */}
          {config.type === "input" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <Label className="text-sm font-semibold text-black">Types de fichiers acceptés</Label>
                </div>
                <div className="space-y-2">
                  {fileTypes.map((fileType) => (
                    <div
                      key={fileType.id}
                      className={cn(
                        "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors",
                        config.acceptedFileTypes?.includes(fileType.id)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100"
                      )}
                      onClick={() => toggleFileType(fileType.id)}
                    >
                      <Checkbox
                        checked={config.acceptedFileTypes?.includes(fileType.id)}
                        onCheckedChange={() => toggleFileType(fileType.id)}
                      />
                      {fileType.iconType === "image" ? (
                        <Image
                          src={fileType.icon}
                          alt={fileType.label}
                          width={24}
                          height={24}
                          className="flex-shrink-0"
                        />
                      ) : (
                        <span className="text-xl flex-shrink-0">{fileType.icon}</span>
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-black">{fileType.label}</div>
                        <div className="text-xs text-zinc-500">{fileType.extension}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI NODE CONFIGURATION (coherence_check & ai_processing) */}
          {isAIStep && (
            <>
              {/* Prompt */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-zinc-500" />
                  <Label className="text-sm font-semibold text-black ">Prompt</Label>
                </div>
                <Textarea
                  value={config.prompt || ""}
                  onChange={(e) => updateConfig({ prompt: e.target.value })}
                  placeholder="Décrivez les instructions pour l'IA..."
                  className="min-h-[120px] text-sm bg-white text-black border-black"
                />
              </div>

              {/* Input/Output Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-zinc-700">Type d&apos;entrée</Label>
                  <Select
                    value={config.inputType}
                    onValueChange={(value) => updateConfig({ inputType: value })}
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {fileTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.iconType === "image" ? (
                              <Image src={type.icon} alt={type.label} width={16} height={16} />
                            ) : (
                              <span className="text-sm">{type.icon}</span>
                            )}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-zinc-700">Type de sortie</Label>
                  <Select
                    value={config.outputType}
                    onValueChange={(value) => updateConfig({ outputType: value })}
                  >
                    <SelectTrigger className="w-full text-black">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-black">
                      {fileTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            {type.iconType === "image" ? (
                              <Image src={type.icon} alt={type.label} width={16} height={16} />
                            ) : (
                              <span className="text-sm">{type.icon}</span>
                            )}
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Enabled Tools */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-zinc-500" />
                  <Label className="text-sm font-semibold text-black">Outils activés</Label>
                </div>
                <div className="max-h-60 overflow-y-auto border border-zinc-200 rounded-lg divide-y divide-zinc-100">
                  {availableTools.map((tool) => (
                    <div
                      key={tool.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors",
                        config.enabledTools?.includes(tool.id)
                          ? "bg-purple-50"
                          : "hover:bg-zinc-50"
                      )}
                      onClick={() => toggleTool(tool.id)}
                    >
                      <Switch
                        checked={config.enabledTools?.includes(tool.id)}
                        onCheckedChange={() => toggleTool(tool.id)}
                        className="scale-90"
                      />
                      {tool.iconType === "image" ? (
                        <Image
                          src={tool.icon}
                          alt={tool.name}
                          width={18}
                          height={18}
                          className="shrink-0"
                        />
                      ) : (
                        <span className="text-base shrink-0">{tool.icon}</span>
                      )}
                      <span className="text-sm text-black">{tool.name}</span>
                      <span className="text-xs text-zinc-400">{tool.capabilities}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Context */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-zinc-500" />
                  <Label className="text-sm font-semibold text-black">Contexte</Label>
                </div>
                <Textarea
                  value={config.context || ""}
                  onChange={(e) => updateConfig({ context: e.target.value })}
                  placeholder="Ajoutez du contexte supplémentaire pour l'IA (informations sur l'entreprise, règles métier, etc.)..."
                  className="min-h-[100px] text-sm bg-white text-black border-black"
                />
                <p className="text-xs text-zinc-500">
                  Le contexte sera inclus dans chaque appel à l&apos;IA pour ce nœud.
                </p>
              </div>
            </>
          )}

          {/* OUTPUT NODE CONFIGURATION */}
          {config.type === "output" && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileOutput className="w-4 h-4 text-zinc-500" />
                  <Label className="text-sm font-semibold text-black">Format de sortie</Label>
                </div>
                <Select
                  value={config.outputFileType}
                  onValueChange={(value) => updateConfig({ outputFileType: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un format" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          {type.iconType === "image" ? (
                            <Image src={type.icon} alt={type.label} width={20} height={20} />
                          ) : (
                            <span className="text-lg">{type.icon}</span>
                          )}
                          <span>{type.label}</span>
                          <span className="text-zinc-400">{type.extension}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-black">Téléchargement automatique</div>
                  <div className="text-xs text-zinc-500">Télécharger le fichier dès que le workflow est terminé</div>
                </div>
                <Switch
                  checked={config.autoDownload}
                  onCheckedChange={(checked) => updateConfig({ autoDownload: checked })}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
