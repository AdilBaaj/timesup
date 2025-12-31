"use client";

import { Download, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { mockHistory, type ExecutionHistory } from "@/data/mock-data";
import { cn } from "@/lib/utils";

interface HistoryPanelProps {
  open: boolean;
  onClose: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateString: string): string {
  // Mock time based on execution ID for demo
  const hash = dateString.split("-").reduce((acc, part) => acc + parseInt(part), 0);
  const hours = (hash % 12) + 8; // Between 8 AM and 8 PM
  const minutes = (hash * 7) % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

function HistoryItem({ execution }: { execution: ExecutionHistory }) {
  const handleDownloadInput = () => {
    alert(`Téléchargement des fichiers d'entrée pour : ${execution.workflowName}`);
  };

  const handleDownloadOutput = () => {
    alert(`Téléchargement du fichier de sortie : ${execution.workflowName.replace(/\s+/g, "_")}_${execution.date}.pptx`);
  };

  return (
    <div className="p-4 border-b border-zinc-200 hover:bg-zinc-50 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {execution.status === "completed" ? (
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            )}
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                execution.status === "completed"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {execution.status === "completed" ? "Terminé" : "Échoué"}
            </span>
          </div>

          <h3 className="text-sm font-medium text-black truncate">
            {execution.workflowName}
          </h3>

          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span>{formatDate(execution.date)}</span>
            <span className="text-zinc-300">|</span>
            <span>{formatTime(execution.date)}</span>
            <span className="text-zinc-300">|</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{execution.duration}</span>
            </div>
          </div>

          <div className="mt-2 text-xs text-zinc-500">
            {execution.stepsCompleted}/{execution.totalSteps} étapes terminées
          </div>

          {/* Download buttons */}
          <div className="flex items-center gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadInput}
              className="h-7 gap-1.5 text-xs border-zinc-300 text-black hover:bg-zinc-100"
            >
              <Download className="w-3 h-3" />
              Entrée
            </Button>
            {execution.status === "completed" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadOutput}
                className="h-7 gap-1.5 text-xs border-zinc-300 text-black hover:bg-zinc-100"
              >
                <Download className="w-3 h-3" />
                Sortie
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HistoryPanel({ open, onClose }: HistoryPanelProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent className="!w-[33%] !max-w-none p-0 bg-white sm:max-w-none">
        <SheetHeader className="px-4 py-4 border-b border-zinc-200">
          <SheetTitle className="text-lg font-bold text-black">
            Historique des exécutions
          </SheetTitle>
          <p className="text-sm text-zinc-500 mt-1">
            {mockHistory.length} exécutions précédentes
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="divide-y divide-zinc-200">
            {mockHistory.map((execution) => (
              <HistoryItem key={execution.id} execution={execution} />
            ))}
          </div>

          {mockHistory.length === 0 && (
            <div className="p-8 text-center text-zinc-500">
              <p className="text-sm">Aucun historique d'exécution</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
