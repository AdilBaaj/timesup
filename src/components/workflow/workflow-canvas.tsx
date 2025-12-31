"use client";

import { workflowSteps, type StepStatus } from "@/data/mock-data";
import { WorkflowNode } from "./workflow-node";
import { ChevronRight } from "lucide-react";

interface WorkflowCanvasProps {
  getStepStatus: (stepId: string) => StepStatus;
  selectedStepId: string | null;
  onStepClick: (stepId: string) => void;
  currentStepIndex: number;
}

export function WorkflowCanvas({
  getStepStatus,
  selectedStepId,
  onStepClick,
  currentStepIndex,
}: WorkflowCanvasProps) {
  // Split into two rows for better display
  const firstRow = workflowSteps.slice(0, 5);
  const secondRow = workflowSteps.slice(5);

  return (
    <div className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Workflow Pipeline</h2>
        {currentStepIndex >= 0 && (
          <div className="text-sm text-zinc-400">
            Step {currentStepIndex + 1} of {workflowSteps.length}
          </div>
        )}
      </div>

      <div className="space-y-8">
        {/* First row */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {firstRow.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <WorkflowNode
                id={step.id}
                name={step.name}
                type={step.type}
                status={getStepStatus(step.id)}
                isSelected={selectedStepId === step.id}
                onClick={() => onStepClick(step.id)}
              />
              {index < firstRow.length - 1 && (
                <ChevronRight className="w-6 h-6 text-zinc-600 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Connector between rows */}
        <div className="flex justify-center">
          <div className="w-px h-8 bg-zinc-700" />
        </div>

        {/* Second row */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4">
          {secondRow.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <WorkflowNode
                id={step.id}
                name={step.name}
                type={step.type}
                status={getStepStatus(step.id)}
                isSelected={selectedStepId === step.id}
                onClick={() => onStepClick(step.id)}
              />
              {index < secondRow.length - 1 && (
                <ChevronRight className="w-6 h-6 text-zinc-600 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
