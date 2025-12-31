"use client";

import { useMemo } from "react";
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

interface WorkflowNodeData extends Record<string, unknown> {
  label: string;
  type: string;
  subtitle: string;
  icon: string;
  status: StepStatus;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  prompt?: string;
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

function WorkflowStepNode({ data }: NodeProps<Node<WorkflowNodeData>>) {
  const accentColor = nodeTypeColors[data.type] || "border-l-zinc-500";

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
            {/* Show Excel/PowerPoint icon based on subtitle */}
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

      {/* Prompt section */}
      {data.prompt && (
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
  workflowStep: WorkflowStepNode,
};

interface ReactFlowCanvasProps {
  getStepStatus: (stepId: string) => StepStatus;
  selectedStepId: string | null;
  onStepClick: (stepId: string) => void;
  currentStepIndex: number;
}

export function ReactFlowCanvas({
  getStepStatus,
  selectedStepId,
  onStepClick,
  currentStepIndex,
}: ReactFlowCanvasProps) {
  // Create nodes from workflow steps - custom layout matching the workflow
  const initialNodes: Node<WorkflowNodeData>[] = useMemo(
    () =>
      workflowSteps.map((step, index) => {
        // Layout: 3 inputs on left, 3 coherence checks, processing in middle, final check, output on right
        let x = 0;
        let y = 0;

        // Custom positioning based on step ID
        const stepId = step.id;

        if (stepId === "step-1") {
          // Marketing Slides - Input
          x = 50;
          y = 50;
        } else if (stepId === "step-2") {
          // Cashflow Excel - Input
          x = 50;
          y = 320;
        } else if (stepId === "step-6") {
          // Reporting Excel - Input
          x = 50;
          y = 590;
        } else if (stepId === "step-4") {
          // Coherence Check for Marketing Slides
          x = 400;
          y = 50;
        } else if (stepId === "step-5") {
          // Coherence Check for Cashflow
          x = 400;
          y = 320;
        } else if (stepId === "step-6b") {
          // Coherence Check for Reporting Excel
          x = 400;
          y = 590;
        } else if (stepId === "step-7") {
          // Fill Reporting Excel
          x = 750;
          y = 320;
        } else if (stepId === "step-3") {
          // Reporting Template - positioned below Fill Reporting Excel
          x = 750;
          y = 590;
        } else if (stepId === "step-8") {
          // Fill Reporting Slides
          x = 1100;
          y = 320;
        } else if (stepId === "step-9") {
          // Final Coherence Check
          x = 1450;
          y = 320;
        } else if (stepId === "step-10") {
          // Export Presentation
          x = 1800;
          y = 320;
        }

        return {
          id: step.id,
          type: "workflowStep",
          position: { x, y },
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
          },
        };
      }),
    [getStepStatus, selectedStepId, onStepClick]
  );

  // Create edges connecting steps
  const initialEdges: Edge[] = useMemo(
    () => [
      // Input to Coherence Checks
      { id: "e1-4", source: "step-1", target: "step-4", animated: currentStepIndex >= 1, type: "smoothstep" },
      { id: "e2-5", source: "step-2", target: "step-5", animated: currentStepIndex >= 2, type: "smoothstep" },
      { id: "e6-6b", source: "step-6", target: "step-6b", animated: currentStepIndex >= 4, type: "smoothstep" },

      // Coherence Checks to Fill Reporting Excel
      { id: "e4-7", source: "step-4", target: "step-7", animated: currentStepIndex >= 5, type: "smoothstep" },
      { id: "e5-7", source: "step-5", target: "step-7", animated: currentStepIndex >= 6, type: "smoothstep" },
      { id: "e6b-7", source: "step-6b", target: "step-7", animated: currentStepIndex >= 7, type: "smoothstep" },

      // Reporting Template goes directly to Fill Reporting Slides
      { id: "e3-8", source: "step-3", target: "step-8", animated: currentStepIndex >= 3, type: "smoothstep" },

      // Fill Reporting Excel to Fill Reporting Slides
      { id: "e7-8", source: "step-7", target: "step-8", animated: currentStepIndex >= 8 },

      // Fill Reporting Slides to Final Coherence Check
      { id: "e8-9", source: "step-8", target: "step-9", animated: currentStepIndex >= 9 },

      // Final Coherence Check to Export
      { id: "e9-10", source: "step-9", target: "step-10", animated: currentStepIndex >= 10 },
    ],
    [currentStepIndex]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when status changes
  useMemo(() => {
    setNodes(
      workflowSteps.map((step) => {
        let x = 0;
        let y = 0;
        const stepId = step.id;

        if (stepId === "step-1") {
          x = 50;
          y = 50;
        } else if (stepId === "step-2") {
          x = 50;
          y = 320;
        } else if (stepId === "step-6") {
          x = 50;
          y = 590;
        } else if (stepId === "step-4") {
          x = 400;
          y = 50;
        } else if (stepId === "step-5") {
          x = 400;
          y = 320;
        } else if (stepId === "step-6b") {
          x = 400;
          y = 590;
        } else if (stepId === "step-7") {
          x = 750;
          y = 320;
        } else if (stepId === "step-3") {
          x = 750;
          y = 590;
        } else if (stepId === "step-8") {
          x = 1100;
          y = 320;
        } else if (stepId === "step-9") {
          x = 1450;
          y = 320;
        } else if (stepId === "step-10") {
          x = 1800;
          y = 320;
        }

        return {
          id: step.id,
          type: "workflowStep",
          position: { x, y },
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
          },
        };
      })
    );
  }, [getStepStatus, selectedStepId, onStepClick, setNodes]);

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
        nodesDraggable={true}
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
