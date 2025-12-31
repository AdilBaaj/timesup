"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  Position,
  Handle,
  NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import { workflowSteps, stepIcons, type StepStatus } from "@/data/mock-data";
import { Upload, CheckCircle, FileText, X } from "lucide-react";

interface RunNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  subtitle: string;
  icon: string;
  status: StepStatus;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  prompt?: string;
  // Upload-specific props for input nodes
  uploadedFile?: File | null;
  onFileUpload?: (file: File | null) => void;
  isRunning: boolean;
  isCompleted: boolean;
  stepId: string;
}

// Node type accent colors
const nodeTypeColors: Record<string, string> = {
  input: "border-l-blue-500",
  coherence_check: "border-l-amber-500",
  ai_processing: "border-l-purple-500",
  output: "border-l-emerald-500",
};

const statusBadgeColors: Record<StepStatus, string> = {
  pending: "bg-zinc-600 text-zinc-300",
  running: "bg-blue-500 text-white animate-pulse",
  completed: "bg-emerald-500 text-white",
  failed: "bg-red-500 text-white",
  needs_review: "bg-amber-500 text-black",
};

// Role badge styles for node types
const nodeRoleBadges: Record<string, { label: string; className: string }> = {
  input: { label: "Input", className: "bg-blue-100 text-blue-700 border-blue-200" },
  coherence_check: { label: "AI Check", className: "bg-amber-100 text-amber-700 border-amber-200" },
  ai_processing: { label: "AI Process", className: "bg-purple-100 text-purple-700 border-purple-200" },
  output: { label: "Output", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
};

function RunStepNode({ data }: NodeProps<Node<RunNodeData>>) {
  const accentColor = nodeTypeColors[data.type] || "border-l-zinc-500";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && data.onFileUpload) {
      data.onFileUpload(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onFileUpload) {
      data.onFileUpload(null);
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const isInputNode = data.type === "input";
  const canUpload = isInputNode && !data.isRunning && !data.isCompleted;

  return (
    <div
      onClick={data.onClick}
      className={cn(
        "relative bg-white rounded-lg shadow-lg cursor-pointer transition-all duration-300 w-[280px] border-l-4",
        accentColor,
        data.isSelected && "ring-2 ring-black scale-105",
        data.status === "running" && "shadow-[0_0_20px_rgba(59,130,246,0.3)]"
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-zinc-400 !w-3 !h-3 !border-2 !border-white"
      />

      {/* Header */}
      <div className="p-4 pb-3 border-b border-zinc-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            {data.subtitle.includes("Excel") && (
              <Image src="/excel.png" alt="Excel" width={20} height={20} className="shrink-0" />
            )}
            {data.subtitle.includes("PowerPoint") && (
              <Image src="/powerpoint.png" alt="PowerPoint" width={20} height={20} className="shrink-0" />
            )}
            <h3 className="text-sm font-bold text-zinc-900 leading-tight">
              {data.label}
            </h3>
          </div>
          <div
            className={cn(
              "px-2 py-0.5 rounded text-xs font-medium ml-2",
              statusBadgeColors[data.status]
            )}
          >
            {data.status === "needs_review"
              ? "Review"
              : data.status === "running"
              ? "Running"
              : data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </div>
        </div>
        {/* Role badge */}
        <div className="flex items-center gap-2">
          {nodeRoleBadges[data.type] && (
            <span className={cn(
              "px-2 py-0.5 rounded border text-xs font-medium",
              nodeRoleBadges[data.type].className
            )}>
              {nodeRoleBadges[data.type].label}
            </span>
          )}
        </div>
      </div>

      {/* Upload zone for input nodes */}
      {isInputNode && (
        <div className="p-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept={data.subtitle.includes("Excel") ? ".xlsx,.xls" : data.subtitle.includes("PowerPoint") ? ".pptx,.ppt" : "*"}
          />

          {data.uploadedFile ? (
            // File uploaded state
            <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-emerald-700 truncate">
                  {data.uploadedFile.name}
                </p>
                <p className="text-xs text-emerald-600">
                  {(data.uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              {canUpload && (
                <button
                  onClick={handleRemoveFile}
                  className="p-1 hover:bg-emerald-100 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-emerald-600" />
                </button>
              )}
            </div>
          ) : (
            // Upload zone
            <button
              onClick={canUpload ? handleUploadClick : undefined}
              disabled={!canUpload}
              className={cn(
                "w-full p-3 border-2 border-dashed rounded-lg transition-colors flex flex-col items-center gap-1",
                canUpload
                  ? "border-zinc-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                  : "border-zinc-200 bg-zinc-50 cursor-not-allowed"
              )}
            >
              <Upload className={cn("w-5 h-5", canUpload ? "text-zinc-400" : "text-zinc-300")} />
              <span className={cn("text-xs", canUpload ? "text-zinc-500" : "text-zinc-400")}>
                {canUpload ? "Cliquez pour uploader" : "Upload désactivé"}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Prompt section for AI nodes */}
      {data.prompt && !isInputNode && (
        <div className="px-4 py-3">
          <p className="text-xs text-zinc-600 leading-relaxed">
            {data.prompt}
          </p>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-zinc-400 !w-3 !h-3 !border-2 !border-white"
      />
    </div>
  );
}

const nodeTypes = {
  runStep: RunStepNode,
};

interface RunFlowCanvasProps {
  getStepStatus: (stepId: string) => StepStatus;
  selectedStepId: string | null;
  onStepClick: (stepId: string) => void;
  currentStepIndex: number;
  uploadedFiles: Record<string, File | null>;
  onFileUpload: (stepId: string, file: File | null) => void;
  isRunning: boolean;
  isCompleted: boolean;
}

export function RunFlowCanvas({
  getStepStatus,
  selectedStepId,
  onStepClick,
  currentStepIndex,
  uploadedFiles,
  onFileUpload,
  isRunning,
  isCompleted,
}: RunFlowCanvasProps) {
  // Helper function to get position based on step ID
  const getStepPosition = (stepId: string) => {
    const positions: Record<string, { x: number; y: number }> = {
      "step-1": { x: 50, y: 50 },
      "step-2": { x: 50, y: 320 },
      "step-6": { x: 50, y: 590 },
      "step-4": { x: 400, y: 50 },
      "step-5": { x: 400, y: 320 },
      "step-6b": { x: 400, y: 590 },
      "step-7": { x: 750, y: 320 },
      "step-3": { x: 750, y: 590 },
      "step-8": { x: 1100, y: 320 },
      "step-9": { x: 1450, y: 320 },
      "step-10": { x: 1800, y: 320 },
    };
    return positions[stepId] || { x: 0, y: 0 };
  };

  // Create nodes from workflow steps
  const initialNodes: Node<RunNodeData>[] = useMemo(
    () =>
      workflowSteps.map((step) => {
        const pos = getStepPosition(step.id);
        return {
          id: step.id,
          type: "runStep",
          position: pos,
          data: {
            label: step.name,
            type: step.type,
            subtitle: step.subtitle,
            icon: stepIcons[step.type],
            status: getStepStatus(step.id),
            description: step.description,
            isSelected: selectedStepId === step.id,
            onClick: () => onStepClick(step.id),
            prompt: step.prompt,
            uploadedFile: uploadedFiles[step.id] || null,
            onFileUpload: (file: File | null) => onFileUpload(step.id, file),
            isRunning,
            isCompleted,
            stepId: step.id,
          },
        };
      }),
    [getStepStatus, selectedStepId, onStepClick, uploadedFiles, onFileUpload, isRunning, isCompleted]
  );

  // Create edges connecting steps
  const initialEdges: Edge[] = useMemo(
    () => [
      { id: "e1-4", source: "step-1", target: "step-4", animated: currentStepIndex >= 1, type: "smoothstep" },
      { id: "e2-5", source: "step-2", target: "step-5", animated: currentStepIndex >= 2, type: "smoothstep" },
      { id: "e6-6b", source: "step-6", target: "step-6b", animated: currentStepIndex >= 4, type: "smoothstep" },
      { id: "e4-7", source: "step-4", target: "step-7", animated: currentStepIndex >= 5, type: "smoothstep" },
      { id: "e5-7", source: "step-5", target: "step-7", animated: currentStepIndex >= 6, type: "smoothstep" },
      { id: "e6b-7", source: "step-6b", target: "step-7", animated: currentStepIndex >= 7, type: "smoothstep" },
      { id: "e3-8", source: "step-3", target: "step-8", animated: currentStepIndex >= 3, type: "smoothstep" },
      { id: "e7-8", source: "step-7", target: "step-8", animated: currentStepIndex >= 8 },
      { id: "e8-9", source: "step-8", target: "step-9", animated: currentStepIndex >= 9 },
      { id: "e9-10", source: "step-9", target: "step-10", animated: currentStepIndex >= 10 },
    ],
    [currentStepIndex]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when status or files change
  useMemo(() => {
    setNodes(
      workflowSteps.map((step) => {
        const pos = getStepPosition(step.id);
        return {
          id: step.id,
          type: "runStep",
          position: pos,
          data: {
            label: step.name,
            type: step.type,
            subtitle: step.subtitle,
            icon: stepIcons[step.type],
            status: getStepStatus(step.id),
            description: step.description,
            isSelected: selectedStepId === step.id,
            onClick: () => onStepClick(step.id),
            prompt: step.prompt,
            uploadedFile: uploadedFiles[step.id] || null,
            onFileUpload: (file: File | null) => onFileUpload(step.id, file),
            isRunning,
            isCompleted,
            stepId: step.id,
          },
        };
      })
    );
  }, [getStepStatus, selectedStepId, onStepClick, uploadedFiles, onFileUpload, isRunning, isCompleted, setNodes]);

  // Update edges animation
  useMemo(() => {
    setEdges([
      { id: "e1-4", source: "step-1", target: "step-4", animated: currentStepIndex >= 1, type: "smoothstep" },
      { id: "e2-5", source: "step-2", target: "step-5", animated: currentStepIndex >= 2, type: "smoothstep" },
      { id: "e6-6b", source: "step-6", target: "step-6b", animated: currentStepIndex >= 4, type: "smoothstep" },
      { id: "e4-7", source: "step-4", target: "step-7", animated: currentStepIndex >= 5, type: "smoothstep" },
      { id: "e5-7", source: "step-5", target: "step-7", animated: currentStepIndex >= 6, type: "smoothstep" },
      { id: "e6b-7", source: "step-6b", target: "step-7", animated: currentStepIndex >= 7, type: "smoothstep" },
      { id: "e3-8", source: "step-3", target: "step-8", animated: currentStepIndex >= 3, type: "smoothstep" },
      { id: "e7-8", source: "step-7", target: "step-8", animated: currentStepIndex >= 8 },
      { id: "e8-9", source: "step-8", target: "step-9", animated: currentStepIndex >= 9 },
      { id: "e9-10", source: "step-9", target: "step-10", animated: currentStepIndex >= 10 },
    ]);
  }, [currentStepIndex, setEdges]);

  return (
    <div className="h-full bg-zinc-100 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.1 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        defaultEdgeOptions={{
          style: { stroke: "#a1a1aa", strokeWidth: 2 },
          type: "smoothstep",
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#d4d4d8"
        />
        <Controls
          showZoom={true}
          showFitView={true}
          showInteractive={false}
          className="!bg-white !border-zinc-300 !shadow-md [&>button]:!bg-white [&>button]:!border-zinc-300 [&>button]:!text-zinc-600 [&>button:hover]:!bg-zinc-100"
        />
      </ReactFlow>
    </div>
  );
}
