"use client";

import { Play, RotateCcw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExecutionControlsProps {
  canStart: boolean;
  isRunning: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  onStart: () => void;
  onApprove: () => void;
  onReset: () => void;
  onDownload: () => void;
  elapsedTime: number;
}

export function ExecutionControls({
  isRunning,
  isPaused,
  isCompleted,
  onStart,
  onReset,
  onDownload,
  elapsedTime,
}: ExecutionControlsProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3">
      {/* Timer */}
      {(isRunning || isCompleted) && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-lg">
          <div className="text-sm font-mono text-black">
            {formatTime(elapsedTime)}
          </div>
          <div className="text-xs text-zinc-500">
            {isCompleted ? "terminé" : "en cours"}
          </div>
        </div>
      )}

      {/* Primary actions */}
      {!isRunning && !isCompleted && (
        <Button
          onClick={onStart}
          size="sm"
          className="gap-2 bg-black hover:bg-zinc-800 text-white"
        >
          <Play className="w-4 h-4" />
          Lancer le workflow
        </Button>
      )}

      {isRunning && !isPaused && (
        <Button disabled size="sm" className="gap-2 bg-blue-600 text-white">
          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
          En cours...
        </Button>
      )}

      {isCompleted && (
        <>
          <Button onClick={onDownload} size="sm" className="gap-2 bg-black hover:bg-zinc-800 text-white">
            <Download className="w-4 h-4" />
            Télécharger
          </Button>
          <Button onClick={onReset} variant="outline" size="sm" className="gap-2 border-zinc-300 text-black hover:bg-zinc-100">
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </Button>
        </>
      )}

      {isRunning && (
        <Button onClick={onReset} variant="outline" size="sm" className="gap-2 border-zinc-300 text-black hover:bg-zinc-100">
          <RotateCcw className="w-4 h-4" />
          Annuler
        </Button>
      )}
    </div>
  );
}
