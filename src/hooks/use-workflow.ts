"use client";

import { useState, useCallback } from "react";
import {
  workflowSteps,
  type StepStatus,
  type StepExecution,
  mockLogs,
} from "@/data/mock-data";

export interface UploadedFile {
  name: string;
  size: number;
  uploadedAt: Date;
}

export interface WorkflowState {
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  currentStepIndex: number;
  stepExecutions: Record<string, StepExecution>;
  uploadedFiles: UploadedFile[];
  startTime: Date | null;
  totalElapsedTime: number;
}

const initialState: WorkflowState = {
  isRunning: false,
  isPaused: false,
  isCompleted: false,
  currentStepIndex: -1,
  stepExecutions: {},
  uploadedFiles: [],
  startTime: null,
  totalElapsedTime: 0,
};

export function useWorkflow() {
  const [state, setState] = useState<WorkflowState>(initialState);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const addFile = useCallback((file: File) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: [
        ...prev.uploadedFiles.filter((f) => f.name !== file.name),
        { name: file.name, size: file.size, uploadedAt: new Date() },
      ],
    }));
  }, []);

  const removeFile = useCallback((fileName: string) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.name !== fileName),
    }));
  }, []);

  // Workflow can always start since inputs are pre-configured
  const canStartWorkflow = true;

  const updateStepStatus = useCallback(
    (stepId: string, status: StepStatus) => {
      setState((prev) => ({
        ...prev,
        stepExecutions: {
          ...prev.stepExecutions,
          [stepId]: {
            ...prev.stepExecutions[stepId],
            stepId,
            status,
            startedAt:
              status === "running"
                ? new Date()
                : prev.stepExecutions[stepId]?.startedAt,
            completedAt:
              status === "completed" || status === "failed"
                ? new Date()
                : undefined,
            logs: mockLogs[stepId] || [],
          },
        },
      }));
    },
    []
  );

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const runWorkflow = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isRunning: true,
      isPaused: false,
      isCompleted: false,
      currentStepIndex: 0,
      startTime: new Date(),
      stepExecutions: {},
    }));

    for (let i = 0; i < workflowSteps.length; i++) {
      const step = workflowSteps[i];

      setState((prev) => ({ ...prev, currentStepIndex: i }));
      updateStepStatus(step.id, "running");

      // Note: No human review step in new workflow structure
      // All steps are automated

      await delay(step.duration);
      updateStepStatus(step.id, "completed");
    }

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
      totalElapsedTime: Date.now() - (prev.startTime?.getTime() || Date.now()),
    }));
  }, [updateStepStatus]);

  const approveReview = useCallback(async () => {
    // Note: No human review in current workflow, but keeping function for compatibility
    setState((prev) => ({ ...prev, isPaused: false }));

    // Continue with remaining steps
    const currentIndex = state.currentStepIndex;
    for (let i = currentIndex + 1; i < workflowSteps.length; i++) {
      const step = workflowSteps[i];
      setState((prev) => ({ ...prev, currentStepIndex: i }));
      updateStepStatus(step.id, "running");
      await delay(step.duration);
      updateStepStatus(step.id, "completed");
    }

    setState((prev) => ({
      ...prev,
      isRunning: false,
      isCompleted: true,
      totalElapsedTime: Date.now() - (prev.startTime?.getTime() || Date.now()),
    }));
  }, [state.currentStepIndex, updateStepStatus]);

  const resetWorkflow = useCallback(() => {
    setState(initialState);
    setSelectedStepId(null);
  }, []);

  const getStepStatus = useCallback(
    (stepId: string): StepStatus => {
      return state.stepExecutions[stepId]?.status || "pending";
    },
    [state.stepExecutions]
  );

  return {
    state,
    selectedStepId,
    setSelectedStepId,
    addFile,
    removeFile,
    canStartWorkflow,
    runWorkflow,
    approveReview,
    resetWorkflow,
    getStepStatus,
  };
}
